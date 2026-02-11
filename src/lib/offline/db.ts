import Dexie, { type Table } from 'dexie';
import type { Tour, Site, Media, SiteMedia } from '@/types';

export interface CachedTour extends Tour {
  cachedAt: string;
}

export interface CachedSite extends Site {
  cachedAt: string;
}

export interface CachedNotificationPreferences {
  id: string;
  device_id: string;
  push_enabled: boolean;
  proximity_enabled: boolean;
  proximity_radius_meters: number;
  dismissed_site_ids: string[];
  cachedAt: string;
}

export interface CachedMedia extends Media {
  cachedAt: string;
  blobUrl?: string;
}

export interface CachedSiteMedia extends SiteMedia {
  cachedAt: string;
}

export interface CachedAsset {
  id: string;
  url: string;
  type: 'image' | 'audio';
  blob: Blob;
  cachedAt: string;
}

export class TourDatabase extends Dexie {
  tours!: Table<CachedTour, string>;
  sites!: Table<CachedSite, string>;
  media!: Table<CachedMedia, string>;
  siteMedia!: Table<CachedSiteMedia, string>;
  assets!: Table<CachedAsset, string>;
  notificationPreferences!: Table<CachedNotificationPreferences, string>;

  constructor() {
    super('VillageWalkingTour');

    this.version(1).stores({
      tours: 'id, slug, is_published, cachedAt',
      sites: 'id, tour_id, display_order, cachedAt',
      media: 'id, file_type, cachedAt',
      siteMedia: 'id, site_id, media_id, cachedAt',
      assets: 'id, url, type, cachedAt',
    });

    // Version 2: Add address fields and notification preferences
    this.version(2).stores({
      tours: 'id, slug, is_published, cachedAt',
      sites: 'id, tour_id, display_order, slug, is_published, cachedAt',
      media: 'id, file_type, cachedAt',
      siteMedia: 'id, site_id, media_id, cachedAt',
      assets: 'id, url, type, cachedAt',
      notificationPreferences: 'id, device_id, cachedAt',
    });
  }
}

export const db = new TourDatabase();

// Helper functions for offline data management
export async function cacheTour(tour: Tour): Promise<void> {
  await db.tours.put({
    ...tour,
    cachedAt: new Date().toISOString(),
  });
}

export async function cacheSites(sites: Site[]): Promise<void> {
  const cachedSites = sites.map((site) => ({
    ...site,
    cachedAt: new Date().toISOString(),
  }));
  await db.sites.bulkPut(cachedSites);
}

export async function cacheMedia(media: Media[]): Promise<void> {
  const cachedMedia = media.map((m) => ({
    ...m,
    cachedAt: new Date().toISOString(),
  }));
  await db.media.bulkPut(cachedMedia);
}

export async function cacheSiteMedia(siteMedia: SiteMedia[]): Promise<void> {
  const cached = siteMedia.map((sm) => ({
    ...sm,
    cachedAt: new Date().toISOString(),
  }));
  await db.siteMedia.bulkPut(cached);
}

export async function cacheAsset(url: string, type: 'image' | 'audio'): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);

    const blob = await response.blob();
    const id = btoa(url); // Simple ID from URL

    await db.assets.put({
      id,
      url,
      type,
      blob,
      cachedAt: new Date().toISOString(),
    });

    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to cache asset:', error);
    throw error;
  }
}

export async function getCachedAssetUrl(url: string): Promise<string | null> {
  const id = btoa(url);
  const asset = await db.assets.get(id);
  if (asset) {
    return URL.createObjectURL(asset.blob);
  }
  return null;
}

export async function getCachedTour(tourId: string): Promise<CachedTour | undefined> {
  return db.tours.get(tourId);
}

export async function getCachedTourBySlug(slug: string): Promise<CachedTour | undefined> {
  return db.tours.where('slug').equals(slug).first();
}

export async function getCachedSitesForTour(tourId: string): Promise<CachedSite[]> {
  return db.sites.where('tour_id').equals(tourId).sortBy('display_order');
}

export async function getCachedMediaForSite(siteId: string): Promise<CachedMedia[]> {
  const siteMediaLinks = await db.siteMedia.where('site_id').equals(siteId).toArray();
  const mediaIds = siteMediaLinks.map((sm) => sm.media_id);
  return db.media.where('id').anyOf(mediaIds).toArray();
}

export async function clearOldCache(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
  const cutoff = new Date(Date.now() - maxAgeMs).toISOString();

  await Promise.all([
    db.tours.where('cachedAt').below(cutoff).delete(),
    db.sites.where('cachedAt').below(cutoff).delete(),
    db.media.where('cachedAt').below(cutoff).delete(),
    db.siteMedia.where('cachedAt').below(cutoff).delete(),
    db.assets.where('cachedAt').below(cutoff).delete(),
  ]);
}

export async function clearAllCache(): Promise<void> {
  await Promise.all([
    db.tours.clear(),
    db.sites.clear(),
    db.media.clear(),
    db.siteMedia.clear(),
    db.assets.clear(),
    db.notificationPreferences.clear(),
  ]);
}

export async function cacheNotificationPreferences(
  prefs: Omit<CachedNotificationPreferences, 'cachedAt'>
): Promise<void> {
  await db.notificationPreferences.put({
    ...prefs,
    cachedAt: new Date().toISOString(),
  });
}

export async function getCachedNotificationPreferences(
  deviceId: string
): Promise<CachedNotificationPreferences | undefined> {
  return db.notificationPreferences.where('device_id').equals(deviceId).first();
}

export async function getCachedSiteBySlug(slug: string): Promise<CachedSite | undefined> {
  return db.sites.where('slug').equals(slug).first();
}

export async function getCachedPublishedSites(): Promise<CachedSite[]> {
  return db.sites.where('is_published').equals(1).toArray();
}
