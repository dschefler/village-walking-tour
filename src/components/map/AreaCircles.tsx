'use client';

import { Source, Layer } from 'react-map-gl';
import { useTenantOptional } from '@/lib/context/tenant-context';
import { circleRing } from '@/lib/utils';
import { getAreaShape, getAreaTint } from '@/lib/area-shapes';

type AreaSite = { id: string; name?: string; latitude: number; longitude: number; is_area?: boolean; area_radius_m?: number };

/** Middle of a closed ring (vertex average), where the area's name is drawn */
function ringCenter(ring: number[][]): [number, number] {
  const pts = ring.slice(0, -1);
  return [
    pts.reduce((sum, p) => sum + p[0], 0) / pts.length,
    pts.reduce((sum, p) => sum + p[1], 0) / pts.length,
  ];
}

// Shaded circles (or exact outlines, see area-shapes) for stops that are a
// neighborhood rather than one building. Each area has its own tint and its
// name in the middle; the edge is a dashed line in the tour's two colors.
// Render inside a react-map-gl <Map>; layer ids are suffixed so several maps
// on one page don't clash.
export function AreaCircles({ sites, idSuffix = '' }: { sites: AreaSite[]; idSuffix?: string }) {
  const tenant = useTenantOptional();
  const areas = sites.filter((s) => s.is_area);
  if (areas.length === 0) return null;

  const trackColor = tenant?.organization.secondary_color || tenant?.organization.primary_color || '#3B82F6';
  const dashColor = tenant?.organization.primary_color || '#1E3A8A';
  const shapes = areas.map((s) => ({
    site: s,
    ring: getAreaShape(s.id) ?? circleRing(s.latitude, s.longitude, s.area_radius_m || 150),
  }));

  const data = {
    type: 'FeatureCollection' as const,
    features: shapes.map(({ site, ring }) => ({
      type: 'Feature' as const,
      properties: { id: site.id, tint: getAreaTint(site.id) },
      geometry: { type: 'Polygon' as const, coordinates: [ring] },
    })),
  };
  const labels = {
    type: 'FeatureCollection' as const,
    features: shapes
      .filter(({ site }) => site.name)
      .map(({ site, ring }) => ({
        type: 'Feature' as const,
        properties: { name: site.name!.trim() },
        geometry: { type: 'Point' as const, coordinates: ringCenter(ring) },
      })),
  };

  return (
    <>
      <Source id={`area-circles${idSuffix}`} type="geojson" data={data}>
        <Layer id={`area-fill${idSuffix}`} type="fill" paint={{ 'fill-color': ['get', 'tint'], 'fill-opacity': 0.22 }} />
        <Layer
          id={`area-track${idSuffix}`}
          type="line"
          layout={{ 'line-join': 'round' }}
          paint={{ 'line-color': trackColor, 'line-width': 3, 'line-opacity': 0.8 }}
        />
        <Layer
          id={`area-outline${idSuffix}`}
          type="line"
          layout={{ 'line-join': 'round' }}
          paint={{ 'line-color': dashColor, 'line-width': 3, 'line-dasharray': [2, 2] }}
        />
      </Source>
      {labels.features.length > 0 && (
        <Source id={`area-labels${idSuffix}`} type="geojson" data={labels}>
          <Layer
            id={`area-label${idSuffix}`}
            type="symbol"
            minzoom={13}
            layout={{
              'text-field': ['get', 'name'],
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': ['interpolate', ['linear'], ['zoom'], 13, 11, 17, 15],
              'text-transform': 'uppercase',
              'text-letter-spacing': 0.08,
              'text-max-width': 8,
              'text-allow-overlap': true,
            }}
            paint={{ 'text-color': dashColor, 'text-halo-color': '#FFFFFF', 'text-halo-width': 1.5 }}
          />
        </Source>
      )}
    </>
  );
}
