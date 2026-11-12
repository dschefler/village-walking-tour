import {
  Landmark,
  Palette,
  Smile,
  Coffee,
  Frame,
  Martini,
  Feather,
  Columns3,
  Camera,
  SquareParking,
  Signpost,
  MapPin,
  type LucideIcon,
} from 'lucide-react';

export type SiteCategory =
  | 'historic_building'
  | 'public_art'
  | 'family'
  | 'art_galleries'
  | 'coffee_shops'
  | 'music_cocktails'
  | 'indigenous'
  | 'plaza'
  | 'photo_ops'
  | 'parking'
  | 'street_names';

interface CategoryDef {
  key: SiteCategory;
  /** Short tag shown on badges and filter chips */
  label: string;
  /** Longer explanation shown in the editor */
  description: string;
  color: string;
  icon: LucideIcon;
}

/** Order here is the order of the filter chips and the editor options */
export const SITE_CATEGORIES: CategoryDef[] = [
  { key: 'historic_building', label: 'Historic / Cultural / Landmark', description: 'Historic and cultural sites, landmark buildings and landmark status plaques', color: '#B91C1C', icon: Landmark },
  { key: 'public_art', label: 'Public Art & Murals', description: 'Art installations, sculptures, murals and notable public works', color: '#7C3AED', icon: Palette },
  { key: 'family', label: 'Family & Kids', description: 'Family and kid-friendly activities and stores', color: '#16A34A', icon: Smile },
  { key: 'indigenous', label: 'Indigenous Art & Culture', description: 'Indigenous art and cultural history', color: '#8B5A2B', icon: Feather },
  { key: 'plaza', label: 'Plaza / Arcade', description: 'Plazas, paseos and arcades', color: '#0891B2', icon: Columns3 },
  { key: 'photo_ops', label: 'Iconic Photo Opportunities', description: 'Iconic, picture-perfect spots for photos', color: '#C026D3', icon: Camera },
  { key: 'art_galleries', label: 'Art Gallery', description: 'Art galleries', color: '#DB2777', icon: Frame },
  { key: 'coffee_shops', label: 'Coffee Shop', description: 'Coffee shops', color: '#EA580C', icon: Coffee },
  { key: 'music_cocktails', label: 'Music & Cocktails', description: 'Live music and cocktail bars', color: '#CA8A04', icon: Martini },
  { key: 'parking', label: 'Parking, EV & Bikes', description: 'Parking, electric vehicle charging and bike parking', color: '#2563EB', icon: SquareParking },
  { key: 'street_names', label: 'Street Names', description: 'Cross streets and the meaning of their names', color: '#0D9488', icon: Signpost },
];

/** Marker color and icon for stops without a category (the previous default look) */
export const UNCATEGORIZED = { color: '#000000', icon: MapPin };

/** Retired keys still stored on some rows, mapped to the category that replaced them */
const MERGED_CATEGORIES: Record<string, SiteCategory> = {
  landmark_plaque: 'historic_building',
};

/** A stored category key, with retired keys mapped to their replacement */
export function normalizeCategory(key: string | null | undefined): SiteCategory | null {
  if (!key) return null;
  return MERGED_CATEGORIES[key] ?? (SITE_CATEGORIES.some((c) => c.key === key) ? (key as SiteCategory) : null);
}

export function getSiteCategory(key: string | null | undefined): CategoryDef | null {
  const normalized = normalizeCategory(key);
  return SITE_CATEGORIES.find((c) => c.key === normalized) ?? null;
}

type CategorizedSite = { category?: string | null; categories?: string[] | null };

/**
 * All of a stop's categories, primary first, normalized and de-duplicated.
 * Falls back to the single `category` column for rows saved before migration 019.
 */
export function siteCategoryKeys(site: CategorizedSite): SiteCategory[] {
  const raw = site.categories?.length ? site.categories : [site.category];
  const keys: SiteCategory[] = [];
  for (const k of raw) {
    const n = normalizeCategory(k);
    if (n && !keys.includes(n)) keys.push(n);
  }
  return keys;
}

/**
 * How to draw a stop's marker: the primary category's icon on its color, or a
 * diagonal two-tone fill when the stop has a second category. Uncategorized
 * stops keep the plain black pin.
 */
export function siteMarkerStyle(site: CategorizedSite): { color: string; background: string; icon: LucideIcon } {
  const defs = siteCategoryKeys(site).map((k) => getSiteCategory(k)!);
  const primary = defs[0] ?? UNCATEGORIZED;
  const background = defs.length > 1
    ? `linear-gradient(135deg, ${defs[0].color} 50%, ${defs[1].color} 50%)`
    : primary.color;
  return { color: primary.color, background, icon: primary.icon };
}
