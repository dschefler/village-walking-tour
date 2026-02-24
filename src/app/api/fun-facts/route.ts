import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const tourId = request.nextUrl.searchParams.get('tourId');
  const siteId = request.nextUrl.searchParams.get('siteId');

  if (!tourId && !siteId) {
    return NextResponse.json({ error: 'tourId or siteId required' }, { status: 400 });
  }

  const supabase = createClient();

  if (siteId) {
    const { data, error } = await supabase
      .from('fun_facts')
      .select('*')
      .eq('site_id', siteId)
      .order('display_order');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }

  // Get all fun facts for all sites in this tour
  const { data: sites } = await supabase
    .from('sites')
    .select('id')
    .eq('tour_id', tourId!);

  if (!sites || sites.length === 0) {
    return NextResponse.json([]);
  }

  const siteIds = sites.map((s) => s.id);
  const { data, error } = await supabase
    .from('fun_facts')
    .select('*')
    .in('site_id', siteIds)
    .order('display_order');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { site_id, fact_text, display_order, audio_url } = body;

  if (!site_id || !fact_text) {
    return NextResponse.json({ error: 'site_id and fact_text required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('fun_facts')
    .insert({ site_id, fact_text, display_order: display_order || 0, audio_url: audio_url || null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const siteId = request.nextUrl.searchParams.get('siteId');
  if (!siteId) {
    return NextResponse.json({ error: 'siteId required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('fun_facts')
    .delete()
    .eq('site_id', siteId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
