/**
 * Visitor amenities drawn on a tenant's map alongside its tour sites —
 * public parking, EV charging and secure bike parking. These aren't tour
 * stops, so they live here rather than in the `sites` table. Keyed by org
 * slug; orgs without an entry get no amenity layer.
 *
 * Santa Barbara positions come from OpenStreetMap's City Lot outlines and
 * the City's downtown parking brochure; EV station counts from the City's
 * EV charging list.
 */

export type AmenityKind = 'parking' | 'ev' | 'bike';

export interface AmenityLink {
  label: string;
  url: string;
}

export interface MapAmenity {
  id: string;
  /** Primary kind sets the marker icon; a parking lot with chargers is ['parking', 'ev']. */
  kinds: AmenityKind[];
  name: string;
  address?: string;
  details: string[];
  latitude: number;
  longitude: number;
  links: AmenityLink[];
}

export const AMENITY_STYLES: Record<AmenityKind, { label: string; color: string }> = {
  parking: { label: 'Parking', color: '#2563EB' },
  ev: { label: 'EV Charging', color: '#16A34A' },
  bike: { label: 'Secure Bike Parking', color: '#0D9488' },
};

const SB_PARKING: AmenityLink = {
  label: 'Downtown parking info',
  url: 'https://santabarbaraca.gov/getting-around/parking/downtown-plaza-and-parking',
};

const SB_BIKE_SPOT: AmenityLink = {
  label: 'Secure Bike Parking membership',
  url: 'https://forms.santabarbaraca.gov/f/BikeSpot',
};

const lot = (
  n: number,
  latitude: number,
  longitude: number,
  extra: Partial<MapAmenity> = {}
): MapAmenity => ({
  id: `sb-lot-${n}`,
  kinds: ['parking'],
  name: `City Lot ${n}`,
  details: [],
  latitude,
  longitude,
  links: [SB_PARKING],
  ...extra,
});

const SANTA_BARBARA: MapAmenity[] = [
  lot(2, 34.420223, -119.701804, { address: '914 Chapala St.' }),
  lot(3, 34.421448, -119.703448),
  lot(4, 34.422092, -119.704635),
  lot(5, 34.423077, -119.705792),
  lot(6, 34.424554, -119.704201, {
    kinds: ['parking', 'ev'],
    name: 'City Lot 6 · Granada Garage',
    address: '1221 Anacapa St.',
    details: ['EV charging: 4 stations (ground level), 30 stations (rooftop)', "8' 2\" max vehicle height"],
  }),
  lot(7, 34.423436, -119.702768, {
    kinds: ['parking', 'ev'],
    name: 'City Lot 7 · Library Garage',
    address: '1115 Anacapa St.',
    details: ['EV charging: 2 stations (ground level)', "8' 2\" max vehicle height"],
  }),
  lot(8, 34.422465, -119.701976),
  lot(9, 34.421377, -119.700765, { address: '921 Anacapa St.' }),
  lot(10, 34.41918, -119.696856, {
    kinds: ['parking', 'ev'],
    name: 'City Lot 10 · Ortega Lot',
    address: '641 Anacapa St.',
    details: ['EV charging available', "7' max vehicle height"],
  }),
  lot(11, 34.417887, -119.69535, {
    kinds: ['parking', 'ev'],
    name: 'City Lot 11 · Old Town Lot',
    address: '523 Anacapa St.',
    details: ['EV charging: 3 stations'],
  }),
  lot(12, 34.415298, -119.694062),
  lot(13, 34.414124, -119.692356, { details: ['Near the Amtrak and Greyhound stations'] }),
  {
    id: 'sb-helena-lot',
    kinds: ['parking', 'ev'],
    name: 'Helena Lot',
    address: '217 Helena Ave.',
    details: ['90-minute parking', 'EV charging: 3 stations'],
    latitude: 34.413806,
    longitude: -119.690501,
    links: [SB_PARKING],
  },
  {
    id: 'sb-harbor-main-lot',
    kinds: ['parking', 'ev'],
    name: 'Harbor Main Lot · Los Baños Pool',
    address: '125 Harbor Way',
    details: [
      'EV charging: 2 stations, managed by the Waterfront Department',
      'Reach the chargers through the lot toward the boat launch ramp',
    ],
    latitude: 34.40373,
    longitude: -119.69327,
    links: [SB_PARKING],
  },
  {
    id: 'sb-bike-granada',
    kinds: ['bike'],
    name: 'Bike Spot · Granada Garage',
    address: '1219 Anacapa St.',
    details: ['78 secure bike racks, members only, 6 am – 11 pm', 'Tools, air, e-bike charging, day-use lockers'],
    latitude: 34.424545,
    longitude: -119.703702,
    links: [SB_BIKE_SPOT],
  },
  {
    id: 'sb-bike-transit-center',
    kinds: ['bike'],
    name: 'Bike Spot · Lot 3 Transit Center',
    address: '9 W. Figueroa St.',
    details: ['Secure bike racks near the MTD Transit Center, members only, 6 am – 11 pm'],
    latitude: 34.422004,
    longitude: -119.703402,
    links: [SB_BIKE_SPOT],
  },
];

const AMENITIES_BY_ORG: Record<string, MapAmenity[]> = {
  'state-street': SANTA_BARBARA,
};

export function getOrgAmenities(orgSlug: string | null | undefined): MapAmenity[] {
  return (orgSlug && AMENITIES_BY_ORG[orgSlug]) || [];
}
