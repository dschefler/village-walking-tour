'use client';

import Link from 'next/link';
import { Navigation, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useNotificationStore } from '@/stores/notification-store';
import { calculateDistance, calculateWalkingTime, formatWalkingTime, formatDistance } from '@/lib/utils';

interface DirectionsButtonProps {
  latitude: number;
  longitude: number;
  name: string;
  backHref?: string;
  className?: string;
}

export function DirectionsButton({
  latitude,
  longitude,
  name,
  backHref = '/historic-sites',
  className = '',
}: DirectionsButtonProps) {
  const { userLocation } = useGeolocation();
  const { setEnabled } = useNotificationStore();

  const distance = userLocation
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        latitude,
        longitude
      )
    : null;

  const walkingTime = distance ? calculateWalkingTime(distance) : null;

  const handleClick = () => {
    // Enable notifications for arrival tracking
    setEnabled(true);

    // Detect platform and use appropriate maps app
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isMac = /Macintosh/.test(navigator.userAgent);

    let url: string;

    // Build origin string from user's current GPS location
    const originStr = userLocation
      ? `${userLocation.latitude},${userLocation.longitude}`
      : '';

    if (isIOS || isMac) {
      // Apple Maps for iOS/macOS - saddr is starting address
      url = userLocation
        ? `maps://maps.apple.com/?saddr=${originStr}&daddr=${latitude},${longitude}&dirflg=w`
        : `maps://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=w`;
    } else {
      // Google Maps for Android and others
      url = userLocation
        ? `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${latitude},${longitude}&travelmode=walking`
        : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
    }

    window.open(url, '_blank');
  };

  return (
    <Card className={className}>
      <CardContent className="py-4 space-y-3">
        <Button
          onClick={handleClick}
          className="w-full bg-primary hover:bg-primary/80 text-primary-foreground"
          size="lg"
        >
          <Navigation className="w-5 h-5 mr-2" />
          <span>Get Directions</span>
          {distance !== null && walkingTime !== null && (
            <span className="ml-2 text-sm opacity-80">
              ({formatDistance(distance)} · {formatWalkingTime(walkingTime)})
            </span>
          )}
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-xs text-gray-500 text-center">
          Opens maps app with turn-by-turn directions
        </p>
        <Button
          asChild
          variant="outline"
          className="w-full"
          size="lg"
        >
          <Link href={backHref}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Locations
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
