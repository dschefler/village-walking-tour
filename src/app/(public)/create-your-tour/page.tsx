'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Route, Check, Loader2, Navigation, Bell, BellOff, MapPinned, ExternalLink, ArrowLeft } from 'lucide-react';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TourRouteMap } from '@/components/map/TourRouteMap';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useProximityNotifications } from '@/hooks/use-proximity-notifications';
import { useNotificationStore } from '@/stores/notification-store';
import { ProximityNotificationContainer } from '@/components/pwa/ProximityNotification';
import { TourCompletePromptContainer } from '@/components/pwa/TourCompletePrompt';

interface SiteItem {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  audio_url: string | null;
  media?: {
    id: string;
    storage_path: string;
    alt_text: string | null;
    is_primary: boolean;
  }[];
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Optimize route using nearest neighbor algorithm
// If userLocation is provided, start from the site nearest to the user
function optimizeRoute(
  sites: SiteItem[],
  userLocation?: { latitude: number; longitude: number } | null
): SiteItem[] {
  if (sites.length === 0) return sites;
  if (sites.length === 1) return sites;

  const optimized: SiteItem[] = [];
  const remaining = [...sites];

  // If we have user location, find the nearest site to start with
  if (userLocation) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    remaining.forEach((site, index) => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        site.latitude,
        site.longitude
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    optimized.push(remaining.splice(nearestIndex, 1)[0]);
  } else {
    // No user location, start with first site
    optimized.push(remaining.shift()!);
  }

  // Continue with nearest neighbor for remaining sites
  while (remaining.length > 0) {
    const lastSite = optimized[optimized.length - 1];
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    remaining.forEach((site, index) => {
      const distance = calculateDistance(
        lastSite.latitude,
        lastSite.longitude,
        site.latitude,
        site.longitude
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    optimized.push(remaining.splice(nearestIndex, 1)[0]);
  }

  return optimized;
}

// Calculate total walking distance
function calculateTotalDistance(sites: SiteItem[]): number {
  let total = 0;
  for (let i = 0; i < sites.length - 1; i++) {
    total += calculateDistance(
      sites[i].latitude,
      sites[i].longitude,
      sites[i + 1].latitude,
      sites[i + 1].longitude
    );
  }
  return total;
}

// Estimate walking time (average 5 km/h = 83.33 m/min)
function estimateWalkingTime(distanceMeters: number): string {
  const minutes = Math.round(distanceMeters / 83.33);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} hr ${remainingMinutes} min`;
}

export default function CreateYourTourPage() {
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hoveredSiteId, setHoveredSiteId] = useState<string | null>(null);
  const [tourCreated, setTourCreated] = useState(false);
  const [createdRoute, setCreatedRoute] = useState<SiteItem[]>([]);
  const [showWalkingGif, setShowWalkingGif] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // GPS and proximity notifications
  const { userLocation, getCurrentPosition, error: geoError } = useGeolocation();
  const { enabled: notificationsEnabled, setEnabled: setNotificationsEnabled } = useNotificationStore();

  // Get the final site ID for tour completion detection
  const finalSiteId = createdRoute.length > 0 ? createdRoute[createdRoute.length - 1].id : undefined;

  // Enable proximity notifications for the created route
  useProximityNotifications({
    sites: createdRoute as any[], // Cast to match Site type
    onAlert: (alert) => {
      console.log('Arrived at:', alert.siteName);
    },
    finalSiteId,
    onFinalDestinationReached: (siteName) => {
      console.log('Tour complete! Arrived at final destination:', siteName);
    },
  });

  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/locations');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setSites(data);
      } catch (error) {
        console.error('Error fetching sites:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSites();
  }, []);

  const totalDistance = useMemo(() => {
    return calculateTotalDistance(createdRoute);
  }, [createdRoute]);

  const toggleSite = (siteId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(siteId)) {
        newSet.delete(siteId);
      } else {
        newSet.add(siteId);
      }
      return newSet;
    });
    // Reset tour when selections change
    if (tourCreated) {
      setTourCreated(false);
      setCreatedRoute([]);
    }
  };

  const selectAll = () => {
    setSelectedIds(new Set(sites.map((s) => s.id)));
  };

  const clearAll = () => {
    setSelectedIds(new Set());
    setTourCreated(false);
    setCreatedRoute([]);
  };

  const createTour = async () => {
    setGettingLocation(true);

    try {
      // Try to get user's current location for optimized routing
      const location = await getCurrentPosition();
      const selected = sites.filter((site) => selectedIds.has(site.id));
      const optimized = optimizeRoute(selected, location);
      setCreatedRoute(optimized);

      // Enable proximity notifications
      setNotificationsEnabled(true);
    } catch (error) {
      // If location fails, still create tour without user location
      console.log('Could not get location, optimizing without user position');
      const selected = sites.filter((site) => selectedIds.has(site.id));
      const optimized = optimizeRoute(selected, null);
      setCreatedRoute(optimized);
    } finally {
      setGettingLocation(false);
      setTourCreated(true);
      setShowWalkingGif(true);
      setTimeout(() => {
        setShowWalkingGif(false);
      }, 3000);
    }
  };

  const resetTour = () => {
    setTourCreated(false);
    setCreatedRoute([]);
  };

  // Open Google Maps with walking directions for the entire route
  const startNavigation = async () => {
    if (createdRoute.length === 0) return;

    // Get current user location for the starting point
    let originStr = '';
    try {
      const currentLocation = await getCurrentPosition();
      if (currentLocation) {
        originStr = `&origin=${currentLocation.latitude},${currentLocation.longitude}`;
      }
    } catch (error) {
      // If we can't get location, let Google Maps use device's current location
      console.log('Could not get current location, using device location');
    }

    if (createdRoute.length === 1) {
      // Single destination - start from user's location
      const dest = createdRoute[0];
      const url = `https://www.google.com/maps/dir/?api=1${originStr}&destination=${dest.latitude},${dest.longitude}&travelmode=walking`;
      window.open(url, '_blank');
      return;
    }

    // Multiple stops: user location is origin, all sites are waypoints except last which is destination
    const destination = createdRoute[createdRoute.length - 1];
    const waypoints = createdRoute.slice(0, -1); // All sites except the last one

    let url = `https://www.google.com/maps/dir/?api=1`;
    url += originStr;
    url += `&destination=${destination.latitude},${destination.longitude}`;

    if (waypoints.length > 0) {
      const waypointStr = waypoints
        .map(site => `${site.latitude},${site.longitude}`)
        .join('|');
      url += `&waypoints=${encodeURIComponent(waypointStr)}`;
    }

    url += `&travelmode=walking`;

    window.open(url, '_blank');
  };

  const getImageUrl = (storagePath: string) => {
    if (storagePath.startsWith('http') || storagePath.startsWith('/')) {
      return storagePath;
    }
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tour-media/${storagePath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <NavigationHeader transparent />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavigationHeader />

      {/* Hero */}
      <header className="bg-black text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Route className="w-8 h-8" />
            Create Your Tour
          </h1>
          <p className="text-gray-300">
            Select the historic sites you want to visit and we&apos;ll create an optimized walking route for you.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Site Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Select Sites ({selectedIds.size} of {sites.length} selected)
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearAll}>
                  Clear
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {sites.map((site) => {
                const primaryImage = site.media?.find((m) => m.is_primary) || site.media?.[0];
                const isSelected = selectedIds.has(site.id);

                return (
                  <div
                    key={site.id}
                    onClick={() => toggleSite(site.id)}
                    onMouseEnter={() => setHoveredSiteId(site.id)}
                    onMouseLeave={() => setHoveredSiteId(null)}
                    className={`
                      bg-white rounded-lg shadow-sm border-2 transition-all duration-200 overflow-hidden cursor-pointer
                      ${isSelected ? 'border-[#A40000] shadow-lg' : 'border-transparent hover:border-gray-300'}
                    `}
                  >
                    <div className="flex items-center">
                      {/* Checkbox */}
                      <div
                        className="pl-4 pr-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSite(site.id)}
                          className="data-[state=checked]:bg-[#A40000] data-[state=checked]:border-[#A40000]"
                        />
                      </div>

                      {/* Image */}
                      <div className="w-20 h-20 flex-shrink-0 relative bg-gray-100">
                        {primaryImage ? (
                          <Image
                            src={getImageUrl(primaryImage.storage_path)}
                            alt={primaryImage.alt_text || site.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-3">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {site.name}
                        </h3>
                        {site.address && (
                          <p className="text-xs text-[#014487] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {site.address}
                          </p>
                        )}
                      </div>

                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="pr-4">
                          <div className="w-6 h-6 rounded-full bg-[#A40000] flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map & Route */}
          <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-160px)] space-y-4">
            {selectedIds.size === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-8 h-full min-h-[400px] flex flex-col items-center justify-center text-center">
                <Route className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Sites Selected
                </h3>
                <p className="text-gray-500">
                  Select historic sites from the list to create your personalized walking tour.
                </p>
              </div>
            ) : !tourCreated ? (
              <div className="bg-white rounded-lg shadow-lg p-8 h-full min-h-[400px] flex flex-col items-center justify-center text-center">
                <Route className="w-16 h-16 text-[#A40000] mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {selectedIds.size} Site{selectedIds.size !== 1 ? 's' : ''} Selected
                </h3>
                <p className="text-gray-500 mb-4">
                  Ready to create your optimized walking tour?
                </p>
                <p className="text-xs text-[#014487] mb-6 flex items-center gap-1">
                  <MapPinned className="w-4 h-4" />
                  Uses your GPS to find the best starting point
                </p>
                <Button
                  size="lg"
                  onClick={createTour}
                  disabled={gettingLocation}
                  className="bg-[#A40000] hover:bg-[#8a0000] text-white gap-2"
                >
                  {gettingLocation ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Getting your location...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-5 h-5" />
                      Create Tour
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <>
                {/* Route Summary */}
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-[#A40000]" />
                      Your Optimized Route
                    </h3>
                    <Button variant="outline" size="sm" onClick={resetTour}>
                      Edit Selection
                    </Button>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">Stops:</span>{' '}
                      <span className="font-semibold">{createdRoute.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Distance:</span>{' '}
                      <span className="font-semibold">{(totalDistance / 1000).toFixed(2)} km</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Est. Walking:</span>{' '}
                      <span className="font-semibold">{estimateWalkingTime(totalDistance)}</span>
                    </div>
                  </div>

                  {/* Route Order */}
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Route Order</p>
                    <div className="flex flex-wrap gap-2">
                      {createdRoute.map((site, index) => (
                        <div
                          key={site.id}
                          className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-sm"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#A40000] text-white text-xs flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="max-w-[120px] truncate">{site.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arrival Notifications Toggle */}
                  <div className="mt-4 pt-4 border-t">
                    <button
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      className="flex items-center gap-2 text-sm w-full"
                    >
                      {notificationsEnabled ? (
                        <Bell className="w-4 h-4 text-[#A40000]" />
                      ) : (
                        <BellOff className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={notificationsEnabled ? 'text-[#A40000] font-medium' : 'text-gray-500'}>
                        {notificationsEnabled ? 'Arrival alerts ON' : 'Arrival alerts OFF'}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {notificationsEnabled ? 'Notifies when you reach each site' : 'Tap to enable'}
                      </span>
                    </button>
                  </div>

                  {/* Start Navigation Button */}
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <Button
                      onClick={startNavigation}
                      className="w-full bg-[#A40000] hover:bg-[#8a0000] text-white gap-2"
                      size="lg"
                    >
                      <Navigation className="w-5 h-5" />
                      Start Walking Directions
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      Opens Google Maps with turn-by-turn directions
                    </p>
                  </div>
                </div>

                {/* Walking GIF - shows for 3 seconds */}
                {showWalkingGif && (
                  <div className="flex justify-center py-2">
                    <iframe
                      src="https://tenor.com/embed/19530863"
                      width="200"
                      height="150"
                      frameBorder="0"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Map */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[400px] lg:h-[calc(100vh-380px)]">
                  <TourRouteMap
                    key={createdRoute.map(s => s.id).join('-')}
                    sites={createdRoute}
                    hoveredSiteId={hoveredSiteId}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Proximity notification popup */}
      <ProximityNotificationContainer />

      {/* Tour complete prompt - shows after reaching final destination */}
      <TourCompletePromptContainer />
    </div>
  );
}
