import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/organizations — list orgs (for super admin) or get current user's org
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if super admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('platform_role')
    .eq('id', user.id)
    .single();

  if (profile?.platform_role === 'super_admin') {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }

  // Regular user — get their org memberships
  const { data: memberships, error } = await supabase
    .from('organization_members')
    .select('*, organization:organizations(*)')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const orgs = memberships?.map((m) => ({
    ...m.organization,
    member_role: m.role,
  })) || [];

  return NextResponse.json(orgs);
}

// POST /api/organizations — create a new org (during onboarding)
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, slug, primary_color, secondary_color, logo_url, app_name, app_description, default_lat, default_lng } = body;

  if (!name || !slug) {
    return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Slug must contain only lowercase letters, numbers, and hyphens' }, { status: 400 });
  }

  // Check slug availability
  const { data: existing } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'This URL is already taken' }, { status: 409 });
  }

  // Create org
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name,
      slug,
      primary_color: primary_color || '#3B82F6',
      secondary_color: secondary_color || '#1E40AF',
      logo_url: logo_url || null,
      app_name: app_name || name,
      app_description: app_description || null,
      default_lat: default_lat || 40.884300,
      default_lng: default_lng || -72.389600,
    })
    .select()
    .single();

  if (orgError) {
    return NextResponse.json({ error: orgError.message }, { status: 500 });
  }

  // Add user as owner
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: org.id,
      user_id: user.id,
      role: 'owner',
    });

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  return NextResponse.json(org, { status: 201 });
}
