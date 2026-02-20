'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import Map, { Marker, NavigationControl, type MapRef } from 'react-map-gl';
import { MapPin } from 'lucide-react';
import { MAPBOX_CONFIG } from '@/lib/mapbox/config';
import 'mapbox-gl/dist/mapbox-gl.css';

interface SiteItem {
  id: string;
  name: string;
  slug: string | null;
  latitude: number;
  longitude: number;
}

interface HistoricSitesMapProps {
  sites: SiteItem[];
  hoveredSiteId: string | null;
  onSiteClick?: (site: SiteItem) => void;
  className?: string;
}

export function HistoricSitesMap({
  sites,
  hoveredSiteId,
  onSiteClick,
  className,
}: HistoricSitesMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Calculate map bounds from sites
  const getBounds = useCallback(() => {
    if (sites.length === 0) return null;

    const lngs = sites.map((s) => s.longitude);
    const lats = sites.map((s) => s.latitude);

    return {
      minLng: Math.min(...lngs) - 0.005,
      maxLng: Math.max(...lngs) + 0.005,
      minLat: Math.min(...lats) - 0.005,
      maxLat: Math.max(...lats) + 0.005,
    };
  }, [sites]);

  // Fit map to sites on load
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

  // Fly to hovered site
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !hoveredSiteId) return;

    const site = sites.find((s) => s.id === hoveredSiteId);
    if (site) {
      mapRef.current.flyTo({
        center: [site.longitude, site.latitude],
        zoom: 16,
        duration: 500,
      });
    }
  }, [mapLoaded, hoveredSiteId, sites]);

  const bounds = getBounds();
  const initialViewState = bounds
    ? {
        longitude: (bounds.minLng + bounds.maxLng) / 2,
        latitude: (bounds.minLat + bounds.maxLat) / 2,
        zoom: 14,
      }
    : {
        longitude: MAPBOX_CONFIG.defaultCenter[0],
        latitude: MAPBOX_CONFIG.defaultCenter[1],
        zoom: MAPBOX_CONFIG.defaultZoom,
      };

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={initialViewState}
      style={{ width: '100%', height: '100%' }}
      mapStyle={MAPBOX_CONFIG.style}
      onLoad={() => setMapLoaded(true)}
      reuseMaps
    >
      <NavigationControl position="top-right" />

      {sites.map((site) => {
        const isHovered = site.id === hoveredSiteId;

        return (
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
              className={`
                relative cursor-pointer transition-all duration-300
                ${isHovered ? 'scale-150 z-50' : 'scale-100 z-10'}
              `}
            >
              {/* Marker pin */}
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full
                  ${isHovered ? 'bg-primary' : 'bg-black'}
                  shadow-lg border-2 border-white
                `}
              >
                <MapPin className="w-4 h-4 text-white" />
              </div>

              {/* Label on hover */}
              {isHovered && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-10 whitespace-nowrap">
                  <div className="bg-black text-white text-xs px-2 py-1 rounded shadow-lg">
                    {site.name}
                  </div>
                </div>
              )}

              {/* Pulse animation on hover */}
              {isHovered && (
                <div className="absolute inset-0 -z-10">
                  <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-50" />
                </div>
              )}
            </div>
          </Marker>
        );
      })}
    </Map>
  );
}
