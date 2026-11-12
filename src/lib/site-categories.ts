import {
  Landmark,
  Award,
  Palette,
  Smile,
  Coffee,
  Frame,
  Martini,
  Feather,
  Columns3,
  SquareParking,
  Signpost,
  MapPin,
  type LucideIcon,
} from 'lucide-react';

export type SiteCategory =
  | 'historic_building'
  | 'landmark_plaque'
  | 'public_art'
  | 'family'
  | 'art_galleries'
  | 'coffee_shops'
  | 'music_cocktails'
  | 'indigenous'
  | 'plaza'
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
  { key: 'historic_building', label: 'Historic / Cultural', description: 'Historic buildings and cultural sites', color: '#475569', icon: Landmark },
  { key: 'landmark_plaque', label: 'Landmark Buildings & Plaques', description: 'Landmark buildings and historic landmark status plaques', color: '#B91C1C', icon: Award },
  { key: 'public_art', label: 'Public Art & Murals', description: 'Art installations, sculptures, murals and notable public works', color: '#7C3AED', icon: Palette },
  { key: 'family', label: 'Family & Kids', description: 'Family and kid-friendly activities and stores', color: '#16A34A', icon: Smile },
  { key: 'indigenous', label: 'Indigenous Art & Culture', description: 'Indigenous art and cultural history', color: '#8B5A2B', icon: Feather },
  { key: 'plaza', label: 'Plaza / Arcade', description: 'Plazas, paseos and arcades', color: '#0891B2', icon: Columns3 },
  { key: 'art_galleries', label: 'Art Gallery', description: 'Art galleries', color: '#DB2777', icon: Frame },
  { key: 'coffee_shops', label: 'Coffee Shop', description: 'Coffee shops', color: '#EA580C', icon: Coffee },
  { key: 'music_cocktails', label: 'Music & Cocktails', description: 'Live music and cocktail bars', color: '#CA8A04', icon: Martini },
  { key: 'parking', label: 'Parking, EV & Bikes', description: 'Parking, electric vehicle charging and bike parking', color: '#2563EB', icon: SquareParking },
  { key: 'street_names', label: 'Street Names', description: 'Cross streets and the meaning of their names', color: '#0D9488', icon: Signpost },
];

/** Marker color and icon for stops without a category (the previous default look) */
export const UNCATEGORIZED = { color: '#000000', icon: MapPin };

export function getSiteCategory(key: string | null | undefined): CategoryDef | null {
  return SITE_CATEGORIES.find((c) => c.key === key) ?? null;
}

/** Color + icon to draw a stop's marker with, falling back to the plain black pin */
export function categoryStyle(key: string | null | undefined): { color: string; icon: LucideIcon } {
  return getSiteCategory(key) ?? UNCATEGORIZED;
}
