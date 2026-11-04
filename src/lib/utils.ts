import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FEET_PER_METER = 3.28084;
const FEET_PER_MILE = 5280;

export function formatDistance(meters: number): string {
  const feet = meters * FEET_PER_METER;
  if (feet < 1000) {
    return `${Math.round(feet)} ft`;
  }
  return `${(feet / FEET_PER_MILE).toFixed(1)} mi`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatBearing(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);

  return ((theta * 180) / Math.PI + 360) % 360;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateId(): string {
  return crypto.randomUUID();
}

// NEXT_PUBLIC_SUPABASE_URL has a trailing newline in the Vercel production
// env var (pasted in with one) — without .trim() the concatenated storage
// URL gets a %0A baked into the middle of it, which Next/Image and <img>
// both silently fail to load. Always build storage URLs through this
// helper rather than concatenating the env var directly.
export function getStorageMediaUrl(storagePath: string): string {
  if (storagePath.startsWith('http') || storagePath.startsWith('/')) {
    return storagePath.trim();
  }
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
  return `${base}/storage/v1/object/public/tour-media/${storagePath}`;
}

/**
 * Calculate estimated walking time from distance in meters
 * Average walking speed: 5 km/h = 83.3 m/min
 */
export function calculateWalkingTime(distanceMeters: number): number {
  return Math.ceil(distanceMeters / 83.3);
}

/**
 * Calculate estimated step count from distance in meters
 * Average stride: 2.5 feet
 */
export function calculateSteps(distanceMeters: number): number {
  const feet = distanceMeters * FEET_PER_METER;
  return Math.round(feet / 2.5);
}

export function formatSteps(steps: number): string {
  if (steps < 1000) return `${steps} steps`;
  return `${(steps / 1000).toFixed(1)}k steps`;
}

/**
 * Calculate estimated driving time from distance in meters
 * 25 mph average with 1.3x road routing factor
 */
export function calculateDrivingTime(distanceMeters: number): number {
  return Math.ceil((distanceMeters * 1.3) / 670);
}

export function formatDrivingTime(minutes: number): string {
  if (minutes < 1) return 'Less than 1 min drive';
  if (minutes < 60) return `${minutes} min drive`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h drive`;
  return `${hours}h ${mins}m drive`;
}

/**
 * Format walking time for display
 */
export function formatWalkingTime(minutes: number): string {
  if (minutes < 1) {
    return 'Less than 1 min';
  }
  if (minutes < 60) {
    return `${minutes} min walk`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h walk`;
  }
  return `${hours}h ${mins}m walk`;
}

/** Distance within which a visitor counts as having arrived at a stop */
export const ARRIVAL_RADIUS_M = 50;

type AreaSite = {
  is_area?: boolean;
  area_radius_m?: number;
  start_point?: string | null;
  address?: string | null;
  address_formatted?: string | null;
};

/** Arrival radius for a stop: the whole circle for an area, 50m for a single place */
export function arrivalRadius(site: AreaSite): number {
  return site.is_area ? Math.max(site.area_radius_m || 150, ARRIVAL_RADIUS_M) : ARRIVAL_RADIUS_M;
}

/**
 * Address line for a stop; areas show where to start instead of a street address.
 * Compact lists pass short = true to show the address as typed rather than the
 * longer geocoded one.
 */
export function siteAddressLabel(site: AreaSite, short = false): string | null {
  if (site.is_area) {
    const start = site.start_point?.trim() || site.address_formatted || site.address;
    return start ? `Start here: ${start}` : null;
  }
  return (short ? site.address : site.address_formatted || site.address) || null;
}

/** Ring of [lng, lat] points approximating a circle, for a GeoJSON polygon */
export function circleRing(latitude: number, longitude: number, radiusM: number, steps = 48): number[][] {
  const dLat = radiusM / 111320;
  const dLng = radiusM / (111320 * Math.cos((latitude * Math.PI) / 180));
  const ring: number[][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * 2 * Math.PI;
    ring.push([longitude + dLng * Math.cos(a), latitude + dLat * Math.sin(a)]);
  }
  return ring;
}
