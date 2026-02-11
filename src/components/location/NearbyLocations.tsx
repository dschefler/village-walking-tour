'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useGeolocation } from '@/hooks/use-geolocation';
import { calculateDistance, formatDistance } from '@/lib/utils';
import type { Site, Media } from '@/types';

interface LocationWithMedia extends Site {
  media?: (Media & { is_primary: boolean; display_order: number })[];
}

interface NearbyLocationsProps {
  currentLocationId: string;
  currentLatitude: number;
  currentLongitude: number;
  maxDistance?: number; // meters
  limit?: number;
}

export function NearbyLocations({
  currentLocationId,
  currentLatitude,
  currentLongitude,
  maxDistance = 5000, // 5km default
  limit = 4,
}: NearbyLocationsProps) {
  const { userLocation } = useGeolocation();
  const [locations, setLocations] = useState<LocationWithMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch('/api/locations');
        if (!response.ok) throw new Error('Failed to fetch');
        const data: LocationWithMedia[] = await response.json();

        // Filter and sort by distance from current location
        const nearby = data
          .filter((loc) => loc.id !== currentLocationId)
          .map((loc) => ({
            ...loc,
            distanceFromCurrent: calculateDistance(
              currentLatitude,
              currentLongitude,
              loc.latitude,
              loc.longitude
            ),
          }))
          .filter((loc) => loc.distanceFromCurrent <= maxDistance)
          .sort((a, b) => a.distanceFromCurrent - b.distanceFromCurrent)
          .slice(0, limit);

        setLocations(nearby);
      } catch (error) {
        console.error('Error fetching nearby locations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, [currentLocationId, currentLatitude, currentLongitude, maxDistance, limit]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-video bg-muted rounded-lg" />
            <div className="mt-2 h-4 bg-muted rounded w-3/4" />
            <div className="mt-1 h-3 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (locations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Nearby Locations</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {locations.map((location) => {
          const primaryImage = location.media?.find((m) => m.is_primary) || location.media?.[0];
          const distanceFromUser = userLocation
            ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                location.latitude,
                location.longitude
              )
            : null;
          const distanceFromCurrent = calculateDistance(
            currentLatitude,
            currentLongitude,
            location.latitude,
            location.longitude
          );

          return (
            <Link key={location.id} href={`/location/${location.slug || location.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                {primaryImage ? (
                  <div className="relative aspect-video">
                    <Image
                      src={primaryImage.storage_path}
                      alt={primaryImage.alt_text || location.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <CardContent className="p-3">
                  <h3 className="font-medium line-clamp-1">{location.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      {formatDistance(distanceFromCurrent)} from here
                    </span>
                    {distanceFromUser !== null && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {formatDistance(distanceFromUser)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
