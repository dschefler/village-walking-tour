'use client';

import { useRef, useState, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl, type MapRef } from 'react-map-gl';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { MAPBOX_CONFIG } from '@/lib/mapbox/config';
import { useGeolocation } from '@/hooks/use-geolocation';
import { calculateDistance, formatDistance } from '@/lib/utils';
import type { Media } from '@/types';
import 'mapbox-gl/dist/mapbox-gl.css';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  name: string;
  primaryImage?: Media;
  className?: string;
}

export function LocationMap({
  latitude,
  longitude,
  name,
  primaryImage,
  className = '',
}: LocationMapProps) {
  const mapRef = useRef<MapRef>(null);
  const { userLocation } = useGeolocation();
  const [showPopup, setShowPopup] = useState(false);

  const distance = userLocation
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        latitude,
        longitude
      )
    : null;

  const handleMarkerClick = useCallback(() => {
    setShowPopup(true);
  }, []);

  return (
    <div className={`relative h-64 md:h-80 rounded-lg overflow-hidden ${className}`}>
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude,
          latitude,
          zoom: 16,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAPBOX_CONFIG.style}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" trackUserLocation showUserHeading />

        <Marker
          longitude={longitude}
          latitude={latitude}
          anchor="bottom"
          onClick={handleMarkerClick}
        >
          <div className="flex flex-col items-center cursor-pointer transition-transform hover:scale-110">
            <div
              className="relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg"
              style={{ backgroundColor: MAPBOX_CONFIG.markerColors.current }}
            >
              <MapPin className="w-6 h-6 text-white" />
            </div>
            {distance !== null && (
              <span className="mt-1 px-2 py-0.5 text-xs font-medium bg-white rounded-full shadow">
                {formatDistance(distance)}
              </span>
            )}
          </div>
        </Marker>

        {showPopup && (
          <Popup
            longitude={longitude}
            latitude={latitude}
            anchor="bottom"
            offset={[0, -45]}
            closeOnClick={false}
            onClose={() => setShowPopup(false)}
            className="location-popup"
          >
            <div className="min-w-[200px]">
              {primaryImage && (
                <div className="relative aspect-video w-full rounded-t overflow-hidden">
                  <Image
                    src={primaryImage.storage_path}
                    alt={primaryImage.alt_text || name}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
              )}
              <div className="p-2">
                <h3 className="font-semibold text-sm">{name}</h3>
                {distance !== null && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistance(distance)} away
                  </p>
                )}
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
