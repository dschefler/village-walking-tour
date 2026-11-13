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
  // Santa Barbara Farmers Market — a cross of closed streets about 30 m wide:
  // State from Cañon Perdido to Figueroa (900–1000 blocks) and Carrillo from
  // Chapala to Anacapa (00 W. and 00 E. blocks)
  'b014dc05-c5d1-4a16-a7a3-c5394db28712': [
    [-119.7021288, 34.4214652],
    [-119.7031423, 34.4204854], // Carrillo at Chapala
    [-119.7028957, 34.4203086],
    [-119.7018848, 34.421286],
    [-119.7007103, 34.4204219], // State at Cañon Perdido
    [-119.7004931, 34.4206231],
    [-119.7016704, 34.4214894],
    [-119.7006303, 34.4224573], // Carrillo at Anacapa
    [-119.7008769, 34.4226341],
    [-119.7019144, 34.4216686],
    [-119.7030824, 34.4225252], // State at Figueroa
    [-119.7032996, 34.422324],
  ],
  // Stearns Wharf — the whole pier, traced from OpenStreetMap way 37312248
  '52f42fc1-f5c9-47c3-8216-83ab207cee2b': [
    [-119.6870921, 34.4107032],
    [-119.6871122, 34.4106824],
    [-119.6869941, 34.4106048],
    [-119.6870875, 34.410508],
    [-119.6859507, 34.4097611],
    [-119.6859182, 34.4097948],
    [-119.6857463, 34.4097759],
    [-119.6854547, 34.4092728],
    [-119.6855493, 34.4092355],
    [-119.6854701, 34.4090988],
    [-119.685412, 34.4090827],
    [-119.685276, 34.4088362],
    [-119.6851996, 34.4088134],
    [-119.685092, 34.4086318],
    [-119.6851113, 34.4080262],
    [-119.6848385, 34.4080203],
    [-119.6848088, 34.4089492],
    [-119.685915, 34.41096],
    [-119.6860347, 34.4109151],
    [-119.6856493, 34.4102145],
    [-119.6859288, 34.4101098],
    [-119.6865745, 34.4105334],
    [-119.6865945, 34.4105127],
    [-119.6887965, 34.4119576],
    [-119.6888767, 34.4118744],
  ],
};

/** The area's outline as a closed GeoJSON ring, or null to fall back to a circle */
export function getAreaShape(siteId: string): [number, number][] | null {
  const corners = AREA_SHAPES[siteId];
  return corners ? [...corners, corners[0]] : null;
}
