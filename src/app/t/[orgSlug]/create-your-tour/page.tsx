'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MapPin, Route, Check, Loader2, Navigation, Bell, BellOff, MapPinned, ExternalLink } from 'lucide-react';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TourRouteMap } from '@/components/map/TourRouteMap';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useProximityNotifications } from '@/hooks/use-proximity-notifications';
import { useNotificationStore } from '@/stores/notification-store';
import { useTenantOptional } from '@/lib/context/tenant-context';
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

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function optimizeRoute(
  sites: SiteItem[],
  userLocation?: { latitude: number; longitude: number } | null
): SiteItem[] {
  if (sites.length <= 1) return sites;
  const optimized: SiteItem[] = [];
  const remaining = [...sites];

  if (userLocation) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    remaining.forEach((site, index) => {
      const distance = calculateDistance(userLocation.latitude, userLocation.longitude, site.latitude, site.longitude);
      if (distance < nearestDistance) { nearestDistance = distance; nearestIndex = index; }
    });
    optimized.push(remaining.splice(nearestIndex, 1)[0]);
  } else {
    optimized.push(remaining.shift()!);
  }

  while (remaining.length > 0) {
    const lastSite = optimized[optimized.length - 1];
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    remaining.forEach((site, index) => {
      const distance = calculateDistance(lastSite.latitude, lastSite.longitude, site.latitude, site.longitude);
      if (distance < nearestDistance) { nearestDistance = distance; nearestIndex = index; }
    });
    optimized.push(remaining.splice(nearestIndex, 1)[0]);
  }
  return optimized;
}

function calculateTotalDistance(sites: SiteItem[]): number {
  let total = 0;
  for (let i = 0; i < sites.length - 1; i++) {
    total += calculateDistance(sites[i].latitude, sites[i].longitude, sites[i + 1].latitude, sites[i + 1].longitude);
  }
  return total;
}

function estimateWalkingTime(distanceMeters: number): string {
  const minutes = Math.round(distanceMeters / 83.33);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hr ${minutes % 60} min`;
}

export default function TenantCreateYourTourPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const tenant = useTenantOptional();
  const primaryColor = tenant?.organization.primary_color ?? '#0B6E69';

  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hoveredSiteId, setHoveredSiteId] = useState<string | null>(null);
  const [tourCreated, setTourCreated] = useState(false);
  const [createdRoute, setCreatedRoute] = useState<SiteItem[]>([]);
  const [showWalkingGif, setShowWalkingGif] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const { userLocation, getCurrentPosition } = useGeolocation();
  const { enabled: notificationsEnabled, setEnabled: setNotificationsEnabled } = useNotificationStore();

  const finalSiteId = createdRoute.length > 0 ? createdRoute[createdRoute.length - 1].id : undefined;

  useProximityNotifications({
    sites: createdRoute as any[],
    onAlert: (alert) => { console.log('Arrived at:', alert.siteName); },
    finalSiteId,
    onFinalDestinationReached: (siteName) => { console.log('Tour complete! Final destination:', siteName); },
  });

  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch(`/api/locations?orgSlug=${orgSlug}`);
        if (!response.ok) throw new Error('Failed to fetch');
        setSites(await response.json());
      } catch (error) {
        console.error('Error fetching sites:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSites();
  }, [orgSlug]);

  const totalDistance = useMemo(() => calculateTotalDistance(createdRoute), [createdRoute]);

  const toggleSite = (siteId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(siteId) ? newSet.delete(siteId) : newSet.add(siteId);
      return newSet;
    });
    if (tourCreated) { setTourCreated(false); setCreatedRoute([]); }
  };

  const selectAll = () => setSelectedIds(new Set(sites.map((s) => s.id)));
  const clearAll = () => { setSelectedIds(new Set()); setTourCreated(false); setCreatedRoute([]); };

  const createTour = async () => {
    setGettingLocation(true);
    try {
      const location = await getCurrentPosition();
      setCreatedRoute(optimizeRoute(sites.filter((s) => selectedIds.has(s.id)), location));
      setNotificationsEnabled(true);
    } catch {
      setCreatedRoute(optimizeRoute(sites.filter((s) => selectedIds.has(s.id)), null));
    } finally {
      setGettingLocation(false);
      setTourCreated(true);
      setShowWalkingGif(true);
      setTimeout(() => setShowWalkingGif(false), 3000);
    }
  };

  const startNavigation = async () => {
    if (createdRoute.length === 0) return;
    let originStr = '';
    try {
      const loc = await getCurrentPosition();
      if (loc) originStr = `&origin=${loc.latitude},${loc.longitude}`;
    } catch { /* use device location */ }

    if (createdRoute.length === 1) {
      const dest = createdRoute[0];
      window.open(`https://www.google.com/maps/dir/?api=1${originStr}&destination=${dest.latitude},${dest.longitude}&travelmode=walking`, '_blank');
      return;
    }

    const destination = createdRoute[createdRoute.length - 1];
    const waypoints = createdRoute.slice(0, -1).map((s) => `${s.latitude},${s.longitude}`).join('|');
    window.open(
      `https://www.google.com/maps/dir/?api=1${originStr}&destination=${destination.latitude},${destination.longitude}&waypoints=${encodeURIComponent(waypoints)}&travelmode=walking`,
      '_blank'
    );
  };

  const getImageUrl = (storagePath: string) => {
    if (storagePath.startsWith('http') || storagePath.startsWith('/')) return storagePath;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tour-media/${storagePath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <NavigationHeader transparent orgSlug={orgSlug} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavigationHeader orgSlug={orgSlug} />

      <header className="text-white py-8" style={{ backgroundColor: primaryColor }}>
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Route className="w-8 h-8" />
            Create Your Tour
          </h1>
          <p className="opacity-90">
            Select the sites you want to visit and we&apos;ll create an optimized walking route for you.
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Site Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Select Sites ({selectedIds.size} of {sites.length} selected)
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
                <Button variant="outline" size="sm" onClick={clearAll}>Clear</Button>
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
                    className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 overflow-hidden cursor-pointer ${
                      isSelected ? 'shadow-lg' : 'border-transparent hover:border-gray-300'
                    }`}
                    style={isSelected ? { borderColor: primaryColor } : {}}
                  >
                    <div className="flex items-center">
                      <div className="pl-4 pr-2" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSite(site.id)}
                        />
                      </div>
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
                      <div className="flex-1 p-3">
                        <h3 className="font-semibold text-gray-900 text-sm">{site.name}</h3>
                        {site.address && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {site.address}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="pr-4">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
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
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Sites Selected</h3>
                <p className="text-gray-500">
                  Select sites from the list to create your personalized walking tour.
                </p>
              </div>
            ) : !tourCreated ? (
              <div className="bg-white rounded-lg shadow-lg p-8 h-full min-h-[400px] flex flex-col items-center justify-center text-center">
                <Route className="w-16 h-16 mb-4" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {selectedIds.size} Site{selectedIds.size !== 1 ? 's' : ''} Selected
                </h3>
                <p className="text-gray-500 mb-4">Ready to create your optimized walking tour?</p>
                <p className="text-xs text-gray-400 mb-6 flex items-center gap-1">
                  <MapPinned className="w-4 h-4" />
                  Uses your GPS to find the best starting point
                </p>
                <Button
                  size="lg"
                  onClick={createTour}
                  disabled={gettingLocation}
                  className="text-white gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  {gettingLocation ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Getting your location...</>
                  ) : (
                    <><Navigation className="w-5 h-5" />Create Tour</>
                  )}
                </Button>
              </div>
            ) : (
              <>
                {/* Route Summary */}
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Navigation className="w-5 h-5" style={{ color: primaryColor }} />
                      Your Optimized Route
                    </h3>
                    <Button variant="outline" size="sm" onClick={() => { setTourCreated(false); setCreatedRoute([]); }}>
                      Edit Selection
                    </Button>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div><span className="text-gray-500">Stops:</span> <span className="font-semibold">{createdRoute.length}</span></div>
                    <div><span className="text-gray-500">Distance:</span> <span className="font-semibold">{(totalDistance / 1000).toFixed(2)} km</span></div>
                    <div><span className="text-gray-500">Est. Walking:</span> <span className="font-semibold">{estimateWalkingTime(totalDistance)}</span></div>
                  </div>

                  {/* Route Order */}
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Route Order</p>
                    <div className="flex flex-wrap gap-2">
                      {createdRoute.map((site, index) => (
                        <div key={site.id} className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-sm">
                          <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
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
                      {notificationsEnabled
                        ? <Bell className="w-4 h-4" style={{ color: primaryColor }} />
                        : <BellOff className="w-4 h-4 text-gray-400" />}
                      <span className={notificationsEnabled ? 'font-medium' : 'text-gray-500'} style={notificationsEnabled ? { color: primaryColor } : {}}>
                        {notificationsEnabled ? 'Arrival alerts ON' : 'Arrival alerts OFF'}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {notificationsEnabled ? 'Notifies when you reach each site' : 'Tap to enable'}
                      </span>
                    </button>
                  </div>

                  {/* Start Navigation */}
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <Button
                      onClick={startNavigation}
                      className="w-full text-white gap-2"
                      style={{ backgroundColor: primaryColor }}
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

                {/* Walking GIF — shows for 3 seconds after tour is created */}
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
                    key={createdRoute.map((s) => s.id).join('-')}
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

      <ProximityNotificationContainer />
      <TourCompletePromptContainer />
    </div>
  );
}
