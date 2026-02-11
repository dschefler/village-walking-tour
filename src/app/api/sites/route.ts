import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const tourId = searchParams.get('tourId');

  let query = supabase.from('sites').select(`
    *,
    site_media (
      *,
      media:media_id (*)
    )
  `);

  if (tourId) {
    query = query.eq('tour_id', tourId);
  }

  const { data, error } = await query.order('display_order');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('sites')
    .insert({
      tour_id: body.tour_id,
      name: body.name,
      description: body.description,
      latitude: body.latitude,
      longitude: body.longitude,
      audio_url: body.audio_url,
      display_order: body.display_order,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
