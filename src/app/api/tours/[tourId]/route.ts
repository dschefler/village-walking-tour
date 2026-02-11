import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

  const { data, error } = await supabase
    .from('tours')
    .update({
      name: body.name,
      slug: body.slug,
      description: body.description,
      estimated_time: body.estimated_time,
      distance_km: body.distance_km,
      cover_image_url: body.cover_image_url,
      is_published: body.is_published,
    })
    .eq('id', tourId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

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
