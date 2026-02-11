import { createClient } from '@/lib/supabase/client';
import {
  db,
  cacheTour,
  cacheSites,
  cacheMedia,
  cacheSiteMedia,
  cacheAsset,
} from './db';
import type { Tour, Site, Media, SiteMedia, TourWithSites } from '@/types';

export async function syncTourForOffline(tourId: string): Promise<void> {
  const supabase = createClient();

  // Fetch tour data
  const { data: tour, error: tourError } = await supabase
    .from('tours')
    .select('*')
    .eq('id', tourId)
    .single();

  if (tourError || !tour) {
    throw new Error('Failed to fetch tour');
  }

  // Fetch sites
  const { data: sites, error: sitesError } = await supabase
    .from('sites')
    .select('*')
    .eq('tour_id', tourId)
    .order('display_order');

  if (sitesError) {
    throw new Error('Failed to fetch sites');
  }

  // Fetch site media relationships
  const siteIds = sites?.map((s) => s.id) || [];
  const { data: siteMediaLinks, error: siteMediaError } = await supabase
    .from('site_media')
    .select('*')
    .in('site_id', siteIds);

  if (siteMediaError) {
    throw new Error('Failed to fetch site media');
  }

  // Fetch media
  const mediaIds = siteMediaLinks?.map((sm) => sm.media_id) || [];
  const { data: media, error: mediaError } = await supabase
    .from('media')
    .select('*')
    .in('id', mediaIds);

  if (mediaError) {
    throw new Error('Failed to fetch media');
  }

  // Cache all data
  await cacheTour(tour as Tour);
  if (sites) await cacheSites(sites as Site[]);
  if (siteMediaLinks) await cacheSiteMedia(siteMediaLinks as SiteMedia[]);
  if (media) await cacheMedia(media as Media[]);

  // Cache media assets (images and audio)
  const cachePromises: Promise<string>[] = [];

  // Cache cover image
  if (tour.cover_image_url) {
    cachePromises.push(cacheAsset(tour.cover_image_url, 'image'));
  }

  // Cache site audio
  for (const site of sites || []) {
    if (site.audio_url) {
      cachePromises.push(cacheAsset(site.audio_url, 'audio'));
    }
  }

  // Cache media files
  for (const m of media || []) {
    if (m.storage_path) {
      const { data: urlData } = supabase.storage
        .from('tour-media')
        .getPublicUrl(m.storage_path);

      if (urlData?.publicUrl) {
        cachePromises.push(
          cacheAsset(urlData.publicUrl, m.file_type as 'image' | 'audio')
        );
      }
    }
  }

  // Wait for all assets to cache (with error handling)
  await Promise.allSettled(cachePromises);
}

export async function getTourFromCacheOrNetwork(
  tourIdOrSlug: string
): Promise<TourWithSites | null> {
  const supabase = createClient();

  // Check if it looks like a UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tourIdOrSlug);

  // Try network first if online
  if (navigator.onLine) {
    try {
      // Build query based on whether we have a UUID or slug
      let query = supabase
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
        .eq('is_published', true);

      if (isUUID) {
        query = query.eq('id', tourIdOrSlug);
      } else {
        query = query.eq('slug', tourIdOrSlug);
      }

      const { data: tour, error } = await query.single();

      if (!error && tour) {
        // Transform and cache
        const transformedTour = transformTourData(tour);

        // Background sync for offline
        syncTourForOffline(tour.id).catch(console.error);

        return transformedTour;
      }
    } catch {
      // Fall through to cache
    }
  }

  // Try cache
  let cachedTour = await db.tours.get(tourIdOrSlug);
  if (!cachedTour) {
    cachedTour = await db.tours.where('slug').equals(tourIdOrSlug).first();
  }

  if (!cachedTour) {
    return null;
  }

  const cachedSites = await db.sites
    .where('tour_id')
    .equals(cachedTour.id)
    .sortBy('display_order');

  const sitesWithMedia = await Promise.all(
    cachedSites.map(async (site) => {
      const siteMediaLinks = await db.siteMedia
        .where('site_id')
        .equals(site.id)
        .toArray();

      const mediaIds = siteMediaLinks.map((sm) => sm.media_id);
      const mediaItems = await db.media.where('id').anyOf(mediaIds).toArray();

      return {
        ...site,
        media: mediaItems.map((m) => {
          const link = siteMediaLinks.find((sm) => sm.media_id === m.id);
          return {
            ...m,
            is_primary: link?.is_primary || false,
            display_order: link?.display_order || 0,
          };
        }),
      };
    })
  );

  return {
    ...cachedTour,
    sites: sitesWithMedia,
  };
}

function transformTourData(tour: Record<string, unknown>): TourWithSites {
  const sites = (tour.sites as Array<Record<string, unknown>>) || [];

  return {
    ...(tour as unknown as Tour),
    sites: sites.map((site) => {
      const siteMedia = (site.site_media as Array<Record<string, unknown>>) || [];

      return {
        ...(site as unknown as Site),
        media: siteMedia.map((sm) => ({
          ...(sm.media as unknown as Media),
          is_primary: sm.is_primary as boolean,
          display_order: sm.display_order as number,
        })),
      };
    }),
  } as TourWithSites;
}

export async function syncLocationForOffline(locationId: string): Promise<void> {
  const supabase = createClient();

  // Fetch site data with media
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('*')
    .eq('id', locationId)
    .single();

  if (siteError || !site) {
    throw new Error('Failed to fetch location');
  }

  // Fetch site media relationships
  const { data: siteMediaLinks, error: siteMediaError } = await supabase
    .from('site_media')
    .select('*')
    .eq('site_id', locationId);

  if (siteMediaError) {
    throw new Error('Failed to fetch site media');
  }

  // Fetch media
  const mediaIds = siteMediaLinks?.map((sm) => sm.media_id) || [];
  const { data: media, error: mediaError } = await supabase
    .from('media')
    .select('*')
    .in('id', mediaIds);

  if (mediaError) {
    throw new Error('Failed to fetch media');
  }

  // Cache data
  await cacheSites([site as Site]);
  if (siteMediaLinks) await cacheSiteMedia(siteMediaLinks as SiteMedia[]);
  if (media) await cacheMedia(media as Media[]);

  // Cache assets
  const cachePromises: Promise<string>[] = [];

  if (site.audio_url) {
    cachePromises.push(cacheAsset(site.audio_url, 'audio'));
  }

  for (const m of media || []) {
    if (m.storage_path) {
      const { data: urlData } = supabase.storage
        .from('tour-media')
        .getPublicUrl(m.storage_path);

      if (urlData?.publicUrl) {
        cachePromises.push(
          cacheAsset(urlData.publicUrl, m.file_type as 'image' | 'audio')
        );
      }
    }
  }

  await Promise.allSettled(cachePromises);
}

export async function getOfflineStatus(): Promise<{
  cachedTours: number;
  cachedSites: number;
  cachedMedia: number;
  cachedAssets: number;
  totalSizeEstimate: string;
}> {
  const [tours, sites, media, assets] = await Promise.all([
    db.tours.count(),
    db.sites.count(),
    db.media.count(),
    db.assets.count(),
  ]);

  // Estimate size (rough calculation)
  let totalBytes = 0;
  const allAssets = await db.assets.toArray();
  for (const asset of allAssets) {
    totalBytes += asset.blob.size;
  }

  const sizeInMB = (totalBytes / (1024 * 1024)).toFixed(2);

  return {
    cachedTours: tours,
    cachedSites: sites,
    cachedMedia: media,
    cachedAssets: assets,
    totalSizeEstimate: `${sizeInMB} MB`,
  };
}
