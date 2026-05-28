import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/curated-tours?orgSlug=xxx — public; no orgSlug = auth'd current org
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgSlug = searchParams.get('orgSlug');
  const supabase = createClient();

  if (orgSlug) {
    const { data: org } = await supabase
      .from('organizations')
      .select('id, curated_tours_enabled')
      .eq('slug', orgSlug)
      .single();

    if (!org || !org.curated_tours_enabled) return NextResponse.json([]);

    const { data, error } = await supabase
      .from('org_curated_tours')
      .select('*')
      .eq('organization_id', org.id)
      .order('display_order', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  // Auth path — admin managing their own org's tours
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 404 });

  const { data, error } = await supabase
    .from('org_curated_tours')
    .select('*')
    .eq('organization_id', membership.organization_id)
    .order('display_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/curated-tours — create
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 404 });

  const body = await request.json();
  const { name, slug, tagline, description, time_estimate, site_names, display_order } = body;

  const { data, error } = await supabase
    .from('org_curated_tours')
    .insert({
      organization_id: membership.organization_id,
      name,
      slug,
      tagline: tagline || '',
      description: description || '',
      time_estimate: time_estimate || '',
      site_names: site_names || [],
      display_order: display_order ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
