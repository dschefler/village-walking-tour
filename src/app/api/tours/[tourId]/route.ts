import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

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

  // Only include fields that were actually sent in the request body
  const allowedFields = ['name', 'slug', 'description', 'estimated_time', 'distance_km', 'cover_image_url', 'is_published'] as const;
  const updateFields: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateFields[field] = body[field];
    }
  }

  // Use service client to bypass RLS (auth already verified above)
  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient
    .from('tours')
    .update(updateFields)
    .eq('id', tourId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  const { error } = await supabase.from('tours').delete().eq('id', tourId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
