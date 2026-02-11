import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { locationId: string } }
) {
  const supabase = createClient();
  const locationId = params.locationId;

  // Try to find by ID first, then by slug
  let query = supabase
    .from('sites')
    .select(`
      *,
      tour:tours(id, name, slug, is_published),
      site_media(
        display_order,
        is_primary,
        media:media_id(*)
      )
    `)
    .eq('is_published', true);

  // Check if it looks like a UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(locationId);

  if (isUUID) {
    query = query.eq('id', locationId);
  } else {
    query = query.eq('slug', locationId);
  }

  const { data: site, error } = await query.single();

  if (error || !site) {
    return NextResponse.json(
      { error: 'Location not found' },
      { status: 404 }
    );
  }

  // Transform the response
  interface SiteMediaItem {
    media: Record<string, unknown>;
    is_primary: boolean;
    display_order: number;
  }

  const location = {
    ...site,
    tour_name: site.tour?.name,
    tour_slug: site.tour?.slug,
    tour_id: site.tour?.id,
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
  };

  return NextResponse.json(location);
}
