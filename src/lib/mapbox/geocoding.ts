/**
 * Mapbox Geocoding API utilities
 */

// Southampton Village, NY 11968 - default proximity for address searches
const SOUTHAMPTON_COORDS = {
  latitude: 40.8843,
  longitude: -72.3903,
};

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  addressFormatted: string;
  placeName: string;
}

export interface GeocodingError {
  message: string;
  code?: string;
}

/**
 * Geocode an address string to coordinates
 * @param address - Address string to geocode
 * @param proximity - Coordinates to bias results toward (the org's own
 *   default location). Every caller previously hardcoded a bias toward
 *   Southampton, NY regardless of which org's address was being entered
 *   — a real problem for any other tenant (e.g. Santa Barbara addresses
 *   could resolve against the wrong "State St", or otherwise skew toward
 *   NY matches). Falls back to Southampton only if nothing is passed in.
 * @returns Promise with geocoding result or null if not found
 */
export async function geocodeAddress(
  address: string,
  proximity: { latitude: number; longitude: number } = SOUTHAMPTON_COORDS
): Promise<GeocodingResult | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    console.error('Mapbox token not configured');
    return null;
  }

  if (!address.trim()) {
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address.trim());
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${token}&limit=1&proximity=${proximity.longitude},${proximity.latitude}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geocoding request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const feature = data.features[0];
    const [longitude, latitude] = feature.center;

    return {
      latitude,
      longitude,
      addressFormatted: feature.place_name,
      placeName: feature.text,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Parse a pasted "lat, lng" pair into numbers. Accepts what Google Maps and
 * GPS apps hand out: "34.4208, -119.6982", "34.4208° N, 119.6982° W" and
 * degrees/minutes/seconds like 34°25'15"N 119°41'54"W. Returns null for
 * anything that isn't a valid coordinate pair (so ordinary addresses fall
 * through to normal geocoding).
 */
export function parseCoordinates(input: string): { latitude: number; longitude: number } | null {
  const text = input
    .trim()
    .toUpperCase()
    .replace(/[\u2212\u2010-\u2015\uFE63\uFF0D]/g, '-') // typographic minus signs and dashes from copied text
    .replace(/[\uFF0C\u060C]/g, ',')
    .replace(/[′’']/g, "'")
    .replace(/[″”"]/g, '"');
  if (!text) return null;

  const part = String.raw`(-?\d+(?:\.\d+)?)\s*°?\s*(?:(\d+(?:\.\d+)?)\s*'\s*)?(?:(\d+(?:\.\d+)?)\s*"\s*)?([NSEW])?`;
  const match = text.match(new RegExp(`^${part}\\s*[,;\\s]\\s*${part}$`));
  if (!match) return null;

  const toDecimal = (deg: string, min?: string, sec?: string) => {
    const d = parseFloat(deg);
    const abs = Math.abs(d) + (min ? parseFloat(min) / 60 : 0) + (sec ? parseFloat(sec) / 3600 : 0);
    return deg.startsWith('-') ? -abs : abs;
  };

  let a = toDecimal(match[1], match[2], match[3]);
  let b = toDecimal(match[5], match[6], match[7]);
  const hemA = match[4];
  const hemB = match[8];
  if (hemA === 'S' || hemA === 'W') a = -Math.abs(a);
  if (hemB === 'S' || hemB === 'W') b = -Math.abs(b);

  // Normally latitude comes first; honor hemisphere letters if they say otherwise.
  const swapped = (hemA === 'E' || hemA === 'W') && (hemB === 'N' || hemB === 'S');
  const latitude = swapped ? b : a;
  const longitude = swapped ? a : b;

  if (!isFinite(latitude) || !isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
}

/**
 * Reverse geocode coordinates to an address
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Promise with address string or null if not found
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodingResult | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    console.error('Mapbox token not configured');
    return null;
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}&limit=1`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Reverse geocoding request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const feature = data.features[0];

    return {
      latitude,
      longitude,
      addressFormatted: feature.place_name,
      placeName: feature.text,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Search for places matching a query with autocomplete
 * @param query - Search query
 * @param proximity - Optional coordinates to bias results towards
 * @returns Promise with array of geocoding results
 */
export async function searchPlaces(
  query: string,
  proximity?: { latitude: number; longitude: number }
): Promise<GeocodingResult[]> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    console.error('Mapbox token not configured');
    return [];
  }

  if (!query.trim()) {
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${token}&limit=5&autocomplete=true`;

    // Use provided proximity or default to Southampton Village, NY
    const coords = proximity || SOUTHAMPTON_COORDS;
    url += `&proximity=${coords.longitude},${coords.latitude}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Place search request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return [];
    }

    return data.features.map((feature: { center: [number, number]; place_name: string; text: string }) => ({
      latitude: feature.center[1],
      longitude: feature.center[0],
      addressFormatted: feature.place_name,
      placeName: feature.text,
    }));
  } catch (error) {
    console.error('Place search error:', error);
    return [];
  }
}
