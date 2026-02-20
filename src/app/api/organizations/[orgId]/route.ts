import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check membership
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', params.orgId)
    .eq('user_id', user.id)
    .single();

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();

  // Only allow updating specific fields
  const allowedFields = [
    'name', 'logo_url', 'icon_url', 'primary_color', 'secondary_color',
    'app_name', 'app_short_name', 'app_description',
    'default_lat', 'default_lng', 'default_zoom',
    'contact_email', 'contact_phone', 'contact_address',
    'onboarding_step', 'onboarding_completed',
    'theme_mode', 'font_family', 'background_color', 'text_color',
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', params.orgId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', params.orgId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}
