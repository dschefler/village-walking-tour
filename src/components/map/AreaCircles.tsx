'use client';

import { useEffect } from 'react';
import { Source, Layer, useMap } from 'react-map-gl';
import { useTenantOptional } from '@/lib/context/tenant-context';
import { circleRing } from '@/lib/utils';
import { getAreaShape } from '@/lib/area-shapes';

type AreaSite = { id: string; latitude: number; longitude: number; is_area?: boolean; area_radius_m?: number };

// Dash patterns that, stepped through in order, slide the dashes along the
// line ("marching ants", after Mapbox's animate-a-line example).
const DASH_SEQUENCE = [
  [0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1], [2.5, 4, 0.5], [3, 4, 0],
  [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5], [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5],
];
const DASH_STEP_MS = 90;

/** Ring in clockwise order, so the dashes march clockwise around every area */
function clockwise(ring: number[][]): number[][] {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    sum += (ring[i + 1][0] - ring[i][0]) * (ring[i + 1][1] + ring[i][1]);
  }
  return sum > 0 ? ring : [...ring].reverse();
}

// Shaded circles (or exact outlines, see area-shapes) for stops that are a
// neighborhood rather than one building. The outline sits on a white casing
// and its dashes slowly march clockwise so the boundary stands out on the map.
// Render inside a react-map-gl <Map>; layer ids are suffixed so several maps
// on one page don't clash.
export function AreaCircles({ sites, idSuffix = '' }: { sites: AreaSite[]; idSuffix?: string }) {
  const tenant = useTenantOptional();
  const { current: map } = useMap();
  const areas = sites.filter((s) => s.is_area);
  const dashId = `area-outline${idSuffix}`;

  useEffect(() => {
    if (!map || areas.length === 0) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    let lastStep = -1;
    const tick = (time: number) => {
      const step = Math.floor(time / DASH_STEP_MS) % DASH_SEQUENCE.length;
      if (step !== lastStep && map.getLayer(dashId)) {
        map.getMap().setPaintProperty(dashId, 'line-dasharray', DASH_SEQUENCE[step]);
        lastStep = step;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [map, dashId, areas.length]);

  if (areas.length === 0) return null;

  const color = tenant?.organization.secondary_color || tenant?.organization.primary_color || '#3B82F6';
  const data = {
    type: 'FeatureCollection' as const,
    features: areas.map((s) => ({
      type: 'Feature' as const,
      properties: { id: s.id },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [clockwise(getAreaShape(s.id) ?? circleRing(s.latitude, s.longitude, s.area_radius_m || 150))],
      },
    })),
  };

  return (
    <Source id={`area-circles${idSuffix}`} type="geojson" data={data}>
      <Layer id={`area-fill${idSuffix}`} type="fill" paint={{ 'fill-color': color, 'fill-opacity': 0.2 }} />
      <Layer
        id={`area-casing${idSuffix}`}
        type="line"
        layout={{ 'line-join': 'round' }}
        paint={{ 'line-color': '#FFFFFF', 'line-width': 5, 'line-opacity': 0.9 }}
      />
      <Layer
        id={`area-track${idSuffix}`}
        type="line"
        layout={{ 'line-join': 'round' }}
        paint={{ 'line-color': color, 'line-width': 3, 'line-opacity': 0.3 }}
      />
      <Layer
        id={dashId}
        type="line"
        layout={{ 'line-join': 'round' }}
        paint={{ 'line-color': color, 'line-width': 3, 'line-dasharray': DASH_SEQUENCE[0] }}
      />
    </Source>
  );
}
