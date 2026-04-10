'use client';

import { useEffect, useState } from 'react';
import { Clock, MapPin, Footprints } from 'lucide-react';
import { useGeolocation } from '@/hooks/use-geolocation';
import { calculateDistance, calculateWalkingTime, formatWalkingTime, formatDistance } from '@/lib/utils';

interface WalkingTimeEstimateProps {
  latitude: number;
  longitude: number;
  className?: string;
}

export function WalkingTimeEstimate({
  latitude,
  longitude,
  className = '',
}: WalkingTimeEstimateProps) {
  const { userLocation, isTracking, startTracking, error } = useGeolocation();
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);

  // Request location on first render
  useEffect(() => {
    if (!hasRequestedLocation && !isTracking && !userLocation) {
      startTracking();
      setHasRequestedLocation(true);
    }
  }, [hasRequestedLocation, isTracking, userLocation, startTracking]);

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <MapPin className="w-4 h-4" />
        <span className="text-sm">Enable location for walking time</span>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <Clock className="w-4 h-4 animate-pulse" />
        <span className="text-sm">Calculating walking time...</span>
      </div>
    );
  }

  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    latitude,
    longitude
  );

  const walkingTime = calculateWalkingTime(distance);

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{formatDistance(distance)}</span>
      </div>
      <div className="flex items-center gap-2">
        <Footprints className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{formatWalkingTime(walkingTime)}</span>
      </div>
    </div>
  );
}
