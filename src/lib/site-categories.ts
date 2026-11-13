import {
  Landmark,
  Palette,
  Coffee,
  Paintbrush,
  Martini,
  Feather,
  Columns3,
  Camera,
  Sparkles,
  SquareParking,
  Signpost,
  MapPin,
  createLucideIcon,
  type LucideIcon,
} from 'lucide-react';

/** Two adults and a child, arms raised — Lucide has no family figure. Solid shapes so it reads at pin size. */
const FamilyIcon = createLucideIcon('Family', [
  ['circle', { cx: '6', cy: '3.6', r: '2.3', fill: 'currentColor', stroke: 'none', key: 'head-l' }],
  ['circle', { cx: '18', cy: '3.6', r: '2.3', fill: 'currentColor', stroke: 'none', key: 'head-r' }],
  ['circle', { cx: '12', cy: '11.4', r: '1.7', fill: 'currentColor', stroke: 'none', key: 'head-c' }],
  ['path', { d: 'M6 8.2v7.3M18 8.2v7.3', strokeWidth: '3.8', key: 'bodies' }],
  ['path', { d: 'M5.1 15v6M6.9 15v6M17.1 15v6M18.9 15v6', strokeWidth: '2', key: 'legs' }],
  ['path', { d: 'M5 8.6 1.6 4.8M7 8.6 12 5.2 17 8.6M19 8.6l3.4-3.8', strokeWidth: '2.2', key: 'arms' }],
  ['path', { d: 'M12 14.2v3.3', strokeWidth: '2.8', key: 'child-body' }],
  ['path', { d: 'M11.4 17v4M12.6 17v4', strokeWidth: '1.4', key: 'child-legs' }],
  ['path', { d: 'M11 14.6 9.2 12.4M13 14.6l1.8-2.2', strokeWidth: '1.5', key: 'child-arms' }],
]);

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
  | 'women_of_vision'
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
  /** false = left out of the menu bar's All Sites dropdown (still on Start Your Tour and the filter) */
  inMenu?: boolean;
}

/** Shown alphabetically everywhere (filter chips, Start Your Tour, menus, editor) */
export const SITE_CATEGORIES: CategoryDef[] = ([
  { key: 'historic_building', label: 'Historic / Cultural / Landmark', description: 'Historic and cultural sites, landmark buildings and landmark status plaques', color: '#B91C1C', icon: Landmark },
  { key: 'public_art', label: 'Public Art & Murals', description: 'Art installations, sculptures, murals and notable public works', color: '#7C3AED', icon: Palette },
  { key: 'family', label: 'Family & Kids', description: 'Family and kid-friendly activities and stores', color: '#16A34A', icon: FamilyIcon },
  { key: 'indigenous', label: 'Indigenous Art & Cultural History', description: 'Indigenous art and cultural history', color: '#8B5A2B', icon: Feather },
  { key: 'plaza', label: 'Plaza / Arcade', description: 'Plazas, paseos and arcades', color: '#0891B2', icon: Columns3 },
  { key: 'photo_ops', label: 'Iconic Photo Opportunity', description: 'Iconic, picture-perfect spots for photos', color: '#D4AF37', icon: Camera },
  { key: 'women_of_vision', label: 'Women of Vision', description: 'Women of Vision', color: '#1E3A8A', icon: Sparkles, inMenu: false },
  { key: 'art_galleries', label: 'Art Gallery', description: 'Art galleries', color: '#DB2777', icon: Paintbrush },
  { key: 'coffee_shops', label: 'Coffee Shop', description: 'Coffee shops', color: '#EA580C', icon: Coffee },
  { key: 'music_cocktails', label: 'Music & Cocktails', description: 'Live music and cocktail bars', color: '#86198F', icon: Martini },
  { key: 'parking', label: 'Parking, EV & Bikes', description: 'Parking, electric vehicle charging and bike parking', color: '#2563EB', icon: SquareParking },
  { key: 'street_names', label: 'Street Names', description: 'Cross streets and the meaning of their names', color: '#0D9488', icon: Signpost },
] satisfies CategoryDef[]).sort((a, b) => a.label.localeCompare(b.label));

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
