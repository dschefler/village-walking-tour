'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import Map, { Marker, NavigationControl, type MapRef } from 'react-map-gl';
import { Check } from 'lucide-react';
import { MAPBOX_CONFIG } from '@/lib/mapbox/config';
import { AreaCircles } from './AreaCircles';
import { AmenityMarkers } from './AmenityMarkers';
import { getOrgAmenities } from '@/lib/map-amenities';
import { useTenantOptional } from '@/lib/context/tenant-context';
import { siteMarkerStyle } from '@/lib/site-categories';
import { getStorageMediaUrl } from '@/lib/utils';
import 'mapbox-gl/dist/mapbox-gl.css';

interface SiteItem {
  id: string;
  name: string;
  slug: string | null;
  latitude: number;
  longitude: number;
  is_area?: boolean;
  area_radius_m?: number;
  category?: string | null;
  categories?: string[] | null;
  media?: { storage_path: string; is_primary?: boolean | null; alt_text?: string | null }[] | null;
}

interface HistoricSitesMapProps {
  sites: SiteItem[];
  hoveredSiteId: string | null;
  onSiteClick?: (site: SiteItem) => void;
  selectedIds?: Set<string>;
  className?: string;
}

export function HistoricSitesMap({
  sites,
  hoveredSiteId,
  onSiteClick,
  selectedIds,
  className,
}: HistoricSitesMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const amenities = getOrgAmenities(useTenantOptional()?.organization.slug);

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

  // Parents often hand over a freshly filtered array on every render; key on
  // the stops themselves so a hover or popup doesn't undo the visitor's zoom.
  const sitesKey = sites.map((s) => `${s.id}:${s.latitude},${s.longitude}`).join('|');
  const latest = useRef({ sites, getBounds });
  latest.current = { sites, getBounds };

  // Fit map to sites on load
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || sites.length === 0) return;

    const bounds = latest.current.getBounds();
    if (bounds) {
      mapRef.current.fitBounds(
        [
          [bounds.minLng, bounds.minLat],
          [bounds.maxLng, bounds.maxLat],
        ],
        { padding: 50, duration: 1000 }
      );
    }
  }, [mapLoaded, sitesKey]);

  // Fly to hovered site
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !hoveredSiteId) return;

    const site = latest.current.sites.find((s) => s.id === hoveredSiteId);
    if (site) {
      mapRef.current.flyTo({
        center: [site.longitude, site.latitude],
        zoom: 16,
        duration: 500,
      });
    }
  }, [mapLoaded, hoveredSiteId]);

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

      <AreaCircles sites={sites} />

      {/* Parking / EV / bike layer sits under the tour-site pins */}
      <AmenityMarkers amenities={amenities} />

      {sites.map((site) => {
        const isHovered = site.id === hoveredSiteId;
        const isSelected = selectedIds?.has(site.id) ?? false;
        const { color, background, icon: CategoryIcon } = siteMarkerStyle(site);

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
              {/* Marker pin — colored and iconed by category; selected stops get a check */}
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2
                  ${isSelected ? 'border-primary ring-2 ring-white' : 'border-white'}
                `}
                style={{ background }}
              >
                {isSelected
                  ? <Check className="w-4 h-4 text-white" />
                  : <CategoryIcon className="w-4 h-4 text-white" />
                }
              </div>

              {/* Photo and name on hover */}
              {isHovered && (() => {
                const img = site.media?.find((m) => m.is_primary) ?? site.media?.[0];
                return (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-28 rounded-md overflow-hidden bg-black shadow-lg pointer-events-none">
                    {img && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getStorageMediaUrl(img.storage_path)}
                        alt={img.alt_text || site.name}
                        className="w-full h-16 object-cover"
                      />
                    )}
                    <div className="text-white text-[9px] leading-tight px-1 py-0.5 line-clamp-2">
                      {site.name}
                    </div>
                  </div>
                );
              })()}

              {/* Pulse animation on hover */}
              {isHovered && (
                <div className="absolute inset-0 -z-10">
                  <div className="absolute inset-0 rounded-full animate-ping opacity-50" style={{ backgroundColor: color }} />
                </div>
              )}
            </div>
          </Marker>
        );
      })}
    </Map>
  );
}
