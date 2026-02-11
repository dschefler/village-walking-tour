'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import Map, { Marker, Popup, Source, Layer, NavigationControl, GeolocateControl, type MapRef, type LayerProps } from 'react-map-gl';
import Image from 'next/image';
import { MapPin, Navigation, User } from 'lucide-react';
import { MAPBOX_CONFIG } from '@/lib/mapbox/config';
import { useTourStore } from '@/stores/tour-store';
import { useGeolocation } from '@/hooks/use-geolocation';
import { cn, calculateDistance, formatDistance } from '@/lib/utils';
import type { Site, SiteWithMedia, Coordinates, Media } from '@/types';
import 'mapbox-gl/dist/mapbox-gl.css';

interface TourMapProps {
  sites: (Site | SiteWithMedia)[];
  onSiteClick?: (site: Site | SiteWithMedia) => void;
  showRoute?: boolean;
  className?: string;
}

const routeLayerStyle: LayerProps = {
  id: 'route',
  type: 'line',
  paint: {
    'line-color': '#3B82F6',
    'line-width': 4,
    'line-opacity': 0.8,
  },
};

export function TourMap({ sites, onSiteClick, showRoute = true, className }: TourMapProps) {
  const mapRef = useRef<MapRef>(null);
  const { selectedSite, tourProgress, currentTour } = useTourStore();
  const { userLocation, isTracking, startTracking } = useGeolocation();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredSite, setHoveredSite] = useState<(Site | SiteWithMedia) | null>(null);

  const visitedSiteIds = currentTour
    ? tourProgress[currentTour.id]?.visitedSites || []
    : [];

  // Calculate map bounds from sites
  const getBounds = useCallback(() => {
    if (sites.length === 0) return null;

    const lngs = sites.map((s) => s.longitude);
    const lats = sites.map((s) => s.latitude);

    return {
      minLng: Math.min(...lngs) - 0.002,
      maxLng: Math.max(...lngs) + 0.002,
      minLat: Math.min(...lats) - 0.002,
      maxLat: Math.max(...lats) + 0.002,
    };
  }, [sites]);

  // Fit map to sites
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || sites.length === 0) return;

    const bounds = getBounds();
    if (bounds) {
      mapRef.current.fitBounds(
        [
          [bounds.minLng, bounds.minLat],
          [bounds.maxLng, bounds.maxLat],
        ],
        { padding: 50, duration: 1000 }
      );
    }
  }, [mapLoaded, sites, getBounds]);

  // Fly to selected site
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !selectedSite) return;

    mapRef.current.flyTo({
      center: [selectedSite.longitude, selectedSite.latitude],
      zoom: 17,
      duration: 1000,
    });
  }, [mapLoaded, selectedSite]);

  // Generate route GeoJSON
  const routeGeoJSON = showRoute && sites.length > 1 ? {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: sites
        .sort((a, b) => a.display_order - b.display_order)
        .map((s) => [s.longitude, s.latitude]),
    },
  } : null;

  const getMarkerColor = (site: Site) => {
    if (selectedSite?.id === site.id) return MAPBOX_CONFIG.markerColors.current;
    if (visitedSiteIds.includes(site.id)) return MAPBOX_CONFIG.markerColors.visited;
    return MAPBOX_CONFIG.markerColors.default;
  };

  const getDistanceToSite = (site: Site | SiteWithMedia, location: Coordinates) => {
    return calculateDistance(
      location.latitude,
      location.longitude,
      site.latitude,
      site.longitude
    );
  };

  const getPrimaryImage = (site: Site | SiteWithMedia): Media | undefined => {
    if ('media' in site && site.media) {
      return site.media.find((m) => m.is_primary) || site.media[0];
    }
    return undefined;
  };

  return (
    <div className={cn('relative h-full w-full', className)}>
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: sites[0]?.longitude || MAPBOX_CONFIG.defaultCenter[0],
          latitude: sites[0]?.latitude || MAPBOX_CONFIG.defaultCenter[1],
          zoom: MAPBOX_CONFIG.defaultZoom,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAPBOX_CONFIG.style}
        onLoad={() => setMapLoaded(true)}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showUserHeading
          onGeolocate={() => {
            if (!isTracking) startTracking();
          }}
        />

        {/* Route line */}
        {routeGeoJSON && (
          <Source id="route" type="geojson" data={routeGeoJSON}>
            <Layer {...routeLayerStyle} />
          </Source>
        )}

        {/* Site markers */}
        {sites.map((site) => (
          <Marker
            key={site.id}
            longitude={site.longitude}
            latitude={site.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onSiteClick?.(site);
            }}
          >
            <div
              className={cn(
                'flex flex-col items-center cursor-pointer transition-transform hover:scale-110',
                selectedSite?.id === site.id && 'scale-125'
              )}
              onMouseEnter={() => setHoveredSite(site)}
              onMouseLeave={() => setHoveredSite(null)}
            >
              <div
                className="relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg"
                style={{ backgroundColor: getMarkerColor(site) }}
              >
                <MapPin className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gray-800 rounded-full">
                  {site.display_order}
                </span>
              </div>
              {userLocation && (
                <span className="mt-1 px-2 py-0.5 text-xs font-medium bg-white rounded-full shadow">
                  {formatDistance(getDistanceToSite(site, userLocation))}
                </span>
              )}
            </div>
          </Marker>
        ))}

        {/* Hover popup */}
        {hoveredSite && (
          <Popup
            longitude={hoveredSite.longitude}
            latitude={hoveredSite.latitude}
            anchor="bottom"
            offset={[0, -45]}
            closeButton={false}
            closeOnClick={false}
            className="tour-map-popup"
          >
            <div className="min-w-[180px] max-w-[220px]">
              {getPrimaryImage(hoveredSite) && (
                <div className="relative aspect-video w-full rounded-t overflow-hidden">
                  <Image
                    src={getPrimaryImage(hoveredSite)!.storage_path}
                    alt={getPrimaryImage(hoveredSite)!.alt_text || hoveredSite.name}
                    fill
                    className="object-cover"
                    sizes="220px"
                  />
                </div>
              )}
              <div className="p-2">
                <h4 className="font-semibold text-sm line-clamp-1">{hoveredSite.name}</h4>
                {userLocation && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistance(getDistanceToSite(hoveredSite, userLocation))} away
                  </p>
                )}
              </div>
            </div>
          </Popup>
        )}

        {/* User location marker (if not using GeolocateControl) */}
        {userLocation && (
          <Marker
            longitude={userLocation.longitude}
            latitude={userLocation.latitude}
            anchor="center"
          >
            <div className="relative">
              <div className="w-6 h-6 bg-violet-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="absolute inset-0 w-6 h-6 bg-violet-500 rounded-full animate-ping opacity-50" />
            </div>
          </Marker>
        )}
      </Map>

      {/* Navigation button */}
      {selectedSite && userLocation && (
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedSite.latitude},${selectedSite.longitude}&travelmode=walking`;
              window.open(url, '_blank');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
          >
            <Navigation className="w-5 h-5" />
            <span>Navigate to {selectedSite.name}</span>
            <span className="text-sm opacity-80">
              ({formatDistance(getDistanceToSite(selectedSite, userLocation))})
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
