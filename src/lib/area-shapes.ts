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
};

/** The area's outline as a closed GeoJSON ring, or null to fall back to a circle */
export function getAreaShape(siteId: string): [number, number][] | null {
  const corners = AREA_SHAPES[siteId];
  return corners ? [...corners, corners[0]] : null;
}
