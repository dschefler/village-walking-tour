export const MAPBOX_CONFIG = {
  style: 'mapbox://styles/mapbox/outdoors-v12',
  defaultCenter: [-72.3903, 40.8843] as [number, number], // Southampton Village, NY
  defaultZoom: 14,
  markerColors: {
    default: '#3B82F6', // blue-500
    visited: '#22C55E', // green-500
    current: '#EF4444', // red-500
    userLocation: '#8B5CF6', // violet-500
  },
};

export const MAP_STYLE_OPTIONS = [
  { id: 'outdoors-v12', name: 'Outdoors', value: 'mapbox://styles/mapbox/outdoors-v12' },
  { id: 'streets-v12', name: 'Streets', value: 'mapbox://styles/mapbox/streets-v12' },
  { id: 'satellite-streets-v12', name: 'Satellite', value: 'mapbox://styles/mapbox/satellite-streets-v12' },
];
