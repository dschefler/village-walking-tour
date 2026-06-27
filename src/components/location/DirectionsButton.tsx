'use client';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import Map, { Source, Layer, Marker, NavigationControl, type MapRef } from 'react-map-gl';
import { Navigation, X, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MAPBOX_CONFIG } from '@/lib/mapbox/config';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useNotificationStore } from '@/stores/notification-store';
import { calculateDistance, calculateWalkingTime, formatWalkingTime, formatDistance } from '@/lib/utils';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Step {
  maneuver: { instruction: string };
  distance: number;
}

interface DirectionsButtonProps {
  latitude: number;
  longitude: number;
  name: string;
  backHref?: string;
  className?: string;
}

function fmtMeters(meters: number): string {
  if (meters < 160) return `${Math.round(meters * 3.281)} ft`;
  const miles = meters / 1609.34;
  return `${miles < 10 ? miles.toFixed(1) : Math.round(miles)} mi`;
}

export function DirectionsButton({
  latitude,
  longitude,
  name,
  backHref = '/historic-sites',
  className = '',
}: DirectionsButtonProps) {
  const mapRef = useRef<MapRef>(null);
  const { userLocation, getCurrentPosition } = useGeolocation();
  const { setEnabled } = useNotificationStore();

  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [routeFeature, setRouteFeature] = useState<GeoJSON.Feature<GeoJSON.LineString> | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [summary, setSummary] = useState<{ distance: number; duration: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const distance = userLocation
    ? calculateDistance(userLocation.latitude, userLocation.longitude, latitude, longitude)
    : null;
  const walkingTime = distance ? calculateWalkingTime(distance) : null;

  // Fit the map to the full route once it loads
  useEffect(() => {
    if (status !== 'ready' || !routeFeature || !mapRef.current) return;
    const coords = routeFeature.geometry.coordinates;
    const lons = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);
    mapRef.current.fitBounds(
      [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]],
      { padding: 52, duration: 600 }
    );
  }, [status, routeFeature]);

  const handleGetDirections = async () => {
    setEnabled(true);
    setStatus('loading');

    // Use cached location or request it fresh
    let location = userLocation;
    if (!location) {
      try {
        location = await getCurrentPosition();
      } catch {
        // Permission denied or unavailable — open external maps as fallback
        setStatus('idle');
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const url = isIOS
          ? `maps://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=w`
          : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
        window.open(url, '_blank');
        return;
      }
    }

    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      const origin = `${location.longitude},${location.latitude}`;
      const dest = `${longitude},${latitude}`;
      const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${origin};${dest}?steps=true&geometries=geojson&overview=full&access_token=${token}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.routes?.length) {
        setStatus('error');
        setErrorMsg('No walking route found.');
        return;
      }

      const route = data.routes[0];
      setRouteFeature({ type: 'Feature', geometry: route.geometry, properties: {} });
      setSteps(route.legs[0].steps ?? []);
      setSummary({ distance: route.distance, duration: route.duration });
      setStatus('ready');
    } catch {
      setStatus('error');
      setErrorMsg('Could not load route — check your connection.');
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setRouteFeature(null);
    setSteps([]);
    setSummary(null);
    setErrorMsg('');
  };

  if (status === 'ready' && routeFeature) {
    return (
      <Card className={className}>
        <CardContent className="p-0 overflow-hidden rounded-lg">
          {/* Route map */}
          <div className="h-64 relative">
            <Map
              ref={mapRef}
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
              initialViewState={{ longitude, latitude, zoom: 15 }}
              style={{ width: '100%', height: '100%' }}
              mapStyle={MAPBOX_CONFIG.style}
            >
              <NavigationControl position="top-right" />

              <Source id="route" type="geojson" data={routeFeature}>
                <Layer
                  id="route-line-casing"
                  type="line"
                  paint={{ 'line-color': '#ffffff', 'line-width': 7 }}
                  layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                />
                <Layer
                  id="route-line"
                  type="line"
                  paint={{ 'line-color': '#2563eb', 'line-width': 4, 'line-opacity': 0.9 }}
                  layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                />
              </Source>

              {/* User location dot */}
              {userLocation && (
                <Marker longitude={userLocation.longitude} latitude={userLocation.latitude}>
                  <div className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-md" />
                </Marker>
              )}

              {/* Destination pin */}
              <Marker longitude={longitude} latitude={latitude} anchor="bottom">
                <div
                  className="w-9 h-9 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--primary, #0064b0)' }}
                >
                  <Navigation className="w-4 h-4 text-white" />
                </div>
              </Marker>
            </Map>
          </div>

          {/* Route summary bar */}
          {summary && (
            <div
              className="px-4 py-3 flex items-center justify-between text-white text-sm"
              style={{ backgroundColor: 'var(--primary, #0064b0)' }}
            >
              <span className="font-semibold truncate mr-3">{name}</span>
              <span className="flex-shrink-0 opacity-90">
                {fmtMeters(summary.distance)} · {Math.ceil(summary.duration / 60)} min walk
              </span>
            </div>
          )}

          {/* Turn-by-turn steps */}
          <div className="max-h-52 overflow-y-auto divide-y divide-border text-sm">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-2.5">
                <span className="w-5 h-5 flex-shrink-0 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-semibold mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="leading-snug">{step.maneuver.instruction}</p>
                  {step.distance > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">{fmtMeters(step.distance)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Close button */}
          <div className="px-4 py-3 border-t">
            <Button onClick={handleClose} variant="outline" className="w-full" size="sm">
              <X className="w-4 h-4 mr-2" />
              Close Directions
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="py-4 space-y-3">
        <Button
          onClick={handleGetDirections}
          className="w-full bg-primary hover:bg-primary/80 text-primary-foreground"
          size="lg"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading route…
            </>
          ) : (
            <>
              <Navigation className="w-5 h-5 mr-2" />
              Get Directions
              {distance !== null && walkingTime !== null && (
                <span className="ml-2 text-sm opacity-80">
                  ({formatDistance(distance)} · {formatWalkingTime(walkingTime)})
                </span>
              )}
            </>
          )}
        </Button>

        {status === 'error' && (
          <p className="text-xs text-destructive text-center">{errorMsg}</p>
        )}

        <p className="text-xs text-muted-foreground text-center">
          {userLocation
            ? 'Shows walking route within the app'
            : 'Enable location for in-app directions'}
        </p>

        <Button asChild variant="outline" className="w-full" size="lg">
          <Link href={backHref}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Locations
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
