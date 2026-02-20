import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const published = searchParams.get('published');
  const orgId = searchParams.get('orgId');

  let query = supabase.from('tours').select(`
    *,
    sites (
      id,
      name,
      display_order
    )
  `);

  if (orgId) {
    query = query.eq('organization_id', orgId);
  }

  if (published === 'true') {
    query = query.eq('is_published', true);
  }

  const { data, error } = await query.order('name');

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
    .from('tours')
    .insert({
      name: body.name,
      slug: body.slug,
      description: body.description,
      organization_id: body.organization_id,
      estimated_time: body.estimated_time,
      distance_km: body.distance_km,
      cover_image_url: body.cover_image_url,
      is_published: body.is_published || false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
