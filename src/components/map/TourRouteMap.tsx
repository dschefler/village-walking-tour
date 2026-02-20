'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Map, { Marker, NavigationControl, Source, Layer, Popup, type MapRef } from 'react-map-gl';
import { MapPin } from 'lucide-react';
import { MAPBOX_CONFIG } from '@/lib/mapbox/config';
import { useTenantOptional } from '@/lib/context/tenant-context';
import 'mapbox-gl/dist/mapbox-gl.css';

interface SiteItem {
  id: string;
  name: string;
  slug: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  media?: {
    id: string;
    storage_path: string;
    alt_text: string | null;
    is_primary: boolean;
  }[];
}

interface TourRouteMapProps {
  sites: SiteItem[];
  hoveredSiteId: string | null;
  className?: string;
}

export function TourRouteMap({
  sites,
  hoveredSiteId,
  className,
}: TourRouteMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [popupSite, setPopupSite] = useState<SiteItem | null>(null);

  const tenant = useTenantOptional();
  const primaryColor = tenant?.organization?.primary_color || '#A40000';

  // Don't render if no sites
  if (sites.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">No sites to display</p>
      </div>
    );
  }

  // Calculate map bounds from sites
  const getBounds = useCallback(() => {
    if (sites.length === 0) return null;

    const lngs = sites.map((s) => s.longitude);
    const lats = sites.map((s) => s.latitude);

    return {
      minLng: Math.min(...lngs) - 0.003,
      maxLng: Math.max(...lngs) + 0.003,
      minLat: Math.min(...lats) - 0.003,
      maxLat: Math.max(...lats) + 0.003,
    };
  }, [sites]);

  // Fit map to sites on load or when sites change
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || sites.length === 0) return;

    const bounds = getBounds();
    if (bounds) {
      mapRef.current.fitBounds(
        [
          [bounds.minLng, bounds.minLat],
          [bounds.maxLng, bounds.maxLat],
        ],
        { padding: 60, duration: 1000 }
      );
    }
  }, [mapLoaded, sites, getBounds]);

  // Fly to hovered site and show popup
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    if (hoveredSiteId) {
      const site = sites.find((s) => s.id === hoveredSiteId);
      if (site) {
        setPopupSite(site);
        mapRef.current.flyTo({
          center: [site.longitude, site.latitude],
          zoom: 16,
          duration: 500,
        });
      }
    } else {
      setPopupSite(null);
    }
  }, [mapLoaded, hoveredSiteId, sites]);

  // Create GeoJSON line for route
  const routeGeoJSON = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: sites.map((site) => [site.longitude, site.latitude]),
    },
  };

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

  const getImageUrl = (storagePath: string) => {
    if (storagePath.startsWith('http') || storagePath.startsWith('/')) {
      return storagePath;
    }
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tour-media/${storagePath}`;
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

      {/* Route Line */}
      {sites.length > 1 && (
        <Source id="route" type="geojson" data={routeGeoJSON}>
          <Layer
            id="route-line"
            type="line"
            paint={{
              'line-color': primaryColor,
              'line-width': 4,
              'line-dasharray': [2, 2],
            }}
          />
        </Source>
      )}

      {/* Site Markers */}
      {sites.map((site, index) => {
        const isHovered = site.id === hoveredSiteId;

        return (
          <Marker
            key={site.id}
            longitude={site.longitude}
            latitude={site.latitude}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopupSite(popupSite?.id === site.id ? null : site);
            }}
          >
            <div
              className={`
                relative cursor-pointer transition-all duration-300
                ${isHovered ? 'scale-125 z-50' : 'scale-100 z-10'}
              `}
            >
              {/* Numbered marker */}
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full
                  ${isHovered ? 'bg-primary' : 'bg-black'}
                  shadow-lg border-2 border-white font-bold text-white text-sm
                `}
              >
                {index + 1}
              </div>

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

      {/* Popup on hover */}
      {popupSite && (
        <Popup
          longitude={popupSite.longitude}
          latitude={popupSite.latitude}
          anchor="bottom"
          offset={20}
          closeButton={false}
          closeOnClick={false}
          className="tour-popup"
        >
          <div className="w-48">
            {popupSite.media && popupSite.media.length > 0 && (
              <div className="relative w-full h-24 -mt-3 -mx-3 mb-2">
                <Image
                  src={getImageUrl(
                    (popupSite.media.find((m) => m.is_primary) || popupSite.media[0]).storage_path
                  )}
                  alt={popupSite.name}
                  fill
                  className="object-cover rounded-t"
                  sizes="192px"
                />
              </div>
            )}
            <div className="px-1">
              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                {popupSite.name}
              </h4>
              {popupSite.address && (
                <p className="text-xs text-[#014487] flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="line-clamp-1">{popupSite.address}</span>
                </p>
              )}
            </div>
          </div>
        </Popup>
      )}
    </Map>
  );
}
