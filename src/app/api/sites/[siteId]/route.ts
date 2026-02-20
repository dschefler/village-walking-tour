import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  const supabase = createClient();
  const { siteId } = params;

  const { data, error } = await supabase
    .from('sites')
    .select(`
      *,
      site_media (
        *,
        media:media_id (*)
      )
    `)
    .eq('id', siteId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  const supabase = createClient();
  const { siteId } = params;
  const body = await request.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.address !== undefined) updateData.address = body.address;
  if (body.latitude !== undefined) updateData.latitude = body.latitude;
  if (body.longitude !== undefined) updateData.longitude = body.longitude;
  if (body.audio_url !== undefined) updateData.audio_url = body.audio_url;
  if (body.display_order !== undefined) updateData.display_order = body.display_order;
  if (body.is_published !== undefined) updateData.is_published = body.is_published;

  const { data, error } = await supabase
    .from('sites')
    .update(updateData)
    .eq('id', siteId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  const supabase = createClient();
  const { siteId } = params;
  const body = await request.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('sites')
    .update({
      name: body.name,
      description: body.description,
      address: body.address,
      latitude: body.latitude,
      longitude: body.longitude,
      display_order: body.display_order,
      is_published: body.is_published,
    })
    .eq('id', siteId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  const supabase = createClient();
  const { siteId } = params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase.from('sites').delete().eq('id', siteId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
