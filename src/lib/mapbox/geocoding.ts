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
 * @returns Promise with geocoding result or null if not found
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
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
    // Bias results toward Southampton Village, NY
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${token}&limit=1&proximity=${SOUTHAMPTON_COORDS.longitude},${SOUTHAMPTON_COORDS.latitude}`;

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
