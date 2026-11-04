'use client';

import { Source, Layer } from 'react-map-gl';
import { useTenantOptional } from '@/lib/context/tenant-context';
import { circleRing } from '@/lib/utils';

type AreaSite = { id: string; latitude: number; longitude: number; is_area?: boolean; area_radius_m?: number };

// Shaded circles for stops that are a neighborhood rather than one building.
// Render inside a react-map-gl <Map>; layer ids are suffixed so several maps
// on one page don't clash.
export function AreaCircles({ sites, idSuffix = '' }: { sites: AreaSite[]; idSuffix?: string }) {
  const tenant = useTenantOptional();
  const areas = sites.filter((s) => s.is_area);
  if (areas.length === 0) return null;

  const color = tenant?.organization.secondary_color || tenant?.organization.primary_color || '#3B82F6';
  const data = {
    type: 'FeatureCollection' as const,
    features: areas.map((s) => ({
      type: 'Feature' as const,
      properties: { id: s.id },
      geometry: { type: 'Polygon' as const, coordinates: [circleRing(s.latitude, s.longitude, s.area_radius_m || 150)] },
    })),
  };

  return (
    <Source id={`area-circles${idSuffix}`} type="geojson" data={data}>
      <Layer id={`area-fill${idSuffix}`} type="fill" paint={{ 'fill-color': color, 'fill-opacity': 0.18 }} />
      <Layer
        id={`area-outline${idSuffix}`}
        type="line"
        paint={{ 'line-color': color, 'line-width': 2, 'line-opacity': 0.7, 'line-dasharray': [2, 2] }}
      />
    </Source>
  );
}
