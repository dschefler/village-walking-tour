import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const orgSlug = request.nextUrl.searchParams.get('orgSlug');

  // Resolve org: by slug (public) or by the authenticated user's membership (admin)
  let orgId: string | null = null;
  if (orgSlug) {
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', orgSlug)
      .single();
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    orgId = org.id;
  } else {
    // No slug — use the authenticated user's org
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      if (membership) orgId = membership.organization_id;
    }
  }

  // Get all published locations with their media
  let query = supabase
    .from('sites')
    .select(`
      *,
      tour:tours(name, slug),
      site_media(
        display_order,
        is_primary,
        media:media_id(*)
      )
    `)
    .eq('is_published', true)
    .order('name');

  if (orgId) {
    query = query.eq('organization_id', orgId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }

  // Transform the response
  interface SiteMediaItem {
    media: Record<string, unknown>;
    is_primary: boolean;
    display_order: number;
  }

  const locations = data?.map((site) => ({
    ...site,
    tour_name: site.tour?.name,
    tour_slug: site.tour?.slug,
    media: site.site_media
      ?.map((sm: SiteMediaItem) => ({
        ...(sm.media as object),
        is_primary: sm.is_primary,
        display_order: sm.display_order,
      }))
      .sort((a: { is_primary: boolean; display_order: number }, b: { is_primary: boolean; display_order: number }) =>
        b.is_primary ? 1 : a.display_order - b.display_order
      ),
    tour: undefined,
    site_media: undefined,
  }));

  return NextResponse.json(locations || []);
}
