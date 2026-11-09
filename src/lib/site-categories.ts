import {
  Landmark,
  Award,
  Palette,
  Smile,
  Coffee,
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
  | 'galleries_coffee'
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
  { key: 'historic_building', label: 'Historic Building', description: 'Historic buildings', color: '#8B5A2B', icon: Landmark },
  { key: 'landmark_plaque', label: 'Landmark Plaque', description: 'Historic landmark status plaques and locations', color: '#B91C1C', icon: Award },
  { key: 'public_art', label: 'Public Art', description: 'Art installations, sculptures, murals and notable public works', color: '#7C3AED', icon: Palette },
  { key: 'family', label: 'Family & Kids', description: 'Family and kid-friendly activities and stores', color: '#16A34A', icon: Smile },
  { key: 'galleries_coffee', label: 'Galleries, Coffee & Cocktails', description: 'Art galleries, coffee shops, music and cocktails', color: '#DB2777', icon: Coffee },
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
