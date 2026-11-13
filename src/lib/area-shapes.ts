/**
 * Exact outlines for neighborhood stops whose boundary is known street by
 * street. Areas listed here are drawn as this polygon instead of the default
 * circle around the pin. Keyed by site id; corners are [longitude, latitude]
 * from OpenStreetMap street intersections.
 */
const AREA_SHAPES: Record<string, [number, number][]> = {
  // Presidio Neighborhood — State, Ortega, Garden and Carrillo Streets
  '1da0313f-071c-4a6d-9985-c07f17161fc8': [
    [-119.7018996, 34.4214773], // State & Carrillo
    [-119.6984874, 34.4246713], // Garden & Carrillo
    [-119.6946682, 34.4218649], // Garden & Ortega
    [-119.698062, 34.4186788], // State & Ortega
  ],
  // Haley Corridor — State, Cota, Milpas and Montecito Streets
  '14fc2ecb-c844-4958-8d5c-88944f1bf7ee': [
    [-119.6967864, 34.417739], // State & Cota
    [-119.6866413, 34.4272767], // Milpas & Cota
    [-119.6827908, 34.4244583], // Milpas & Montecito
    [-119.692935, 34.4149309], // State & Montecito
  ],
  // The Funk Zone — State, Montecito (US 101), Garden and Cabrillo
  'ee7f7fde-82c9-45c9-974a-34266f67a27e': [
    [-119.692935, 34.4149309], // State & Montecito
    [-119.6893001, 34.417953], // Garden & Montecito (Garden passes under 101 here)
    [-119.6867684, 34.4143046], // Garden & Cabrillo
    [-119.689196, 34.4121844], // State & Cabrillo
  ],
};

/** The area's outline as a closed GeoJSON ring, or null to fall back to a circle */
export function getAreaShape(siteId: string): [number, number][] | null {
  const corners = AREA_SHAPES[siteId];
  return corners ? [...corners, corners[0]] : null;
}
