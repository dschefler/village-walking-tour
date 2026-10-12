import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getRequesterMembership } from '@/lib/auth/membership';

export async function GET(
  request: NextRequest,
  { params }: { params: { tourId: string } }
) {
  const supabase = createClient();
  const { tourId } = params;

  const { data, error } = await supabase
    .from('tours')
    .select(`
      *,
      sites (
        *,
        site_media (
          *,
          media:media_id (*)
        )
      )
    `)
    .or(`id.eq.${tourId},slug.eq.${tourId}`)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { tourId: string } }
) {
  const supabase = createClient();
  const { tourId } = params;
  const body = await request.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Previously this derived no org at all and updated by tourId alone
  // through the service client (which bypasses RLS) — any logged-in user
  // of any org could rewrite any other org's tour. Must re-verify the
  // tour actually belongs to the caller's own org before writing.
  const membership = await getRequesterMembership(supabase, user.id);
  if (!membership) {
    return NextResponse.json({ error: 'No organization' }, { status: 403 });
  }

  // Only include fields that were actually sent in the request body
  const allowedFields = ['name', 'slug', 'description', 'estimated_time', 'distance_km', 'cover_image_url', 'is_published'] as const;
  const updateFields: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateFields[field] = body[field];
    }
  }

  // Service client bypasses RLS for the write itself, but ownership was
  // already verified above, and the organization_id filter below ensures
  // the update is a no-op if tourId belongs to a different org.
  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient
    .from('tours')
    .update(updateFields)
    .eq('id', tourId)
    .eq('organization_id', membership.organization_id)
    .select()
    .single();

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500;
    return NextResponse.json({ error: status === 404 ? 'Tour not found' : error.message }, { status });
  }

  return NextResponse.json(data);
}

// PUT alias for PATCH — ensures compatibility with any callers using PUT
export const PUT = PATCH;

export async function DELETE(
  request: NextRequest,
  { params }: { params: { tourId: string } }
) {
  const supabase = createClient();
  const { tourId } = params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const membership = await getRequesterMembership(supabase, user.id);
  if (!membership) {
    return NextResponse.json({ error: 'No organization' }, { status: 403 });
  }

  const { error } = await supabase
    .from('tours')
    .delete()
    .eq('id', tourId)
    .eq('organization_id', membership.organization_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
