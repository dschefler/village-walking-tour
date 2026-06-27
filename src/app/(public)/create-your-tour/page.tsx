'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Route, Check, Loader2, Navigation, Bell, BellOff, MapPinned, Car, Footprints, X, Map, List, Bookmark, Volume2, VolumeX, ChevronRight } from 'lucide-react';
import { warmUpSpeech, setSpeechMuted, isSpeechMuted, speak } from '@/lib/speech';
import { cn } from '@/lib/utils';
import { CURATED_TOURS, matchesLocation, type CuratedTour } from '@/lib/curated-tours';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TourRouteMap } from '@/components/map/TourRouteMap';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useProximityNotifications } from '@/hooks/use-proximity-notifications';
import { useNotificationStore } from '@/stores/notification-store';
import { useTourBuilderStore } from '@/stores/tour-builder-store';
import { ProximityNotification } from '@/components/pwa/ProximityNotification';
import type { ProximityAlert } from '@/types';
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

interface NavStep {
  maneuver: {
    instruction: string;
    location?: [number, number]; // [lng, lat]
    type?: string;
    modifier?: string;
  };
  distance: number;
}

const FEET_PER_METER = 3.28084;
const FEET_PER_MILE = 5280;

function formatDistanceImperial(meters: number): string {
  const feet = meters * FEET_PER_METER;
  if (feet < 1000) return `${Math.round(feet)} ft`;
  return `${(feet / FEET_PER_MILE).toFixed(1)} mi`;
}

function estimateWalkingTime(distanceMeters: number): string {
  const minutes = Math.round(distanceMeters / 83.33);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hr ${minutes % 60} min`;
}

function estimateDrivingTime(distanceMeters: number): string {
  const minutes = Math.ceil((distanceMeters * 1.3) / 670);
  if (minutes < 1) return 'Less than 1 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}

function estimateSteps(distanceMeters: number): string {
  const steps = Math.round((distanceMeters * FEET_PER_METER) / 2.5);
  if (steps < 1000) return `${steps} steps`;
  return `${(steps / 1000).toFixed(1)}k steps`;
}

function TourNotificationContainer({
  createdRoute,
  userLocation,
}: {
  createdRoute: SiteItem[];
  userLocation: { latitude: number; longitude: number } | null;
}) {
  const { recentAlerts, enabled, triggerTourComplete } = useNotificationStore();
  const [currentAlert, setCurrentAlert] = useState<ProximityAlert | null>(null);

  const finalSiteId = createdRoute.length > 0 ? createdRoute[createdRoute.length - 1].id : undefined;

  useEffect(() => {
    if (enabled && recentAlerts.length > 0) {
      setCurrentAlert(recentAlerts[0]);
    }
  }, [recentAlerts, enabled]);

  if (!currentAlert || createdRoute.length === 0) return null;

  const currentIdx = createdRoute.findIndex((s) => s.id === currentAlert.siteId);
  const nextSite =
    currentIdx >= 0 && currentIdx < createdRoute.length - 1
      ? createdRoute[currentIdx + 1]
      : null;
  const nextDist =
    nextSite && userLocation
      ? calculateDistance(userLocation.latitude, userLocation.longitude, nextSite.latitude, nextSite.longitude)
      : null;
  const isFinalStop = !!finalSiteId && currentAlert.siteId === finalSiteId;

  const handleDismiss = () => {
    setCurrentAlert(null);
    // Only show tour-complete after user explicitly dismisses the final stop card
    if (isFinalStop) triggerTourComplete(currentAlert.siteName);
  };

  return (
    <ProximityNotification
      alert={currentAlert}
      onDismiss={handleDismiss}
      nextStop={nextSite ? { name: nextSite.name, distanceMeters: nextDist ?? 0 } : undefined}
      isFinalStop={isFinalStop}
    />
  );
}

export default function CreateYourTourPage() {
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hoveredSiteId, setHoveredSiteId] = useState<string | null>(null);
  const [tourCreated, setTourCreated] = useState(false);
  const [createdRoute, setCreatedRoute] = useState<SiteItem[]>([]);
  const [showWalkingGif, setShowWalkingGif] = useState(false);
  const [travelMode, setTravelMode] = useState<'walking' | 'driving'>('walking');
  const [mapboxRoute, setMapboxRoute] = useState<GeoJSON.Feature<GeoJSON.LineString> | null>(null);
  const [navSteps, setNavSteps] = useState<NavStep[]>([]);
  const [navLoading, setNavLoading] = useState(false);
  const [savedLocation, setSavedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapboxFailed, setMapboxFailed] = useState(false);
  const [followMode, setFollowMode] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showCuratedModal, setShowCuratedModal] = useState(false);
  const { pendingIds, clear: clearPending } = useTourBuilderStore();

  const routeSectionRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(-1);
  const [isMuted, setMutedState] = useState(() => {
    if (typeof window === 'undefined') return false;
    return isSpeechMuted();
  });

  // GPS and proximity notifications
  const { startTracking, userLocation, heading } = useGeolocation({ maximumAge: 0, enableHighAccuracy: true });
  const { enabled: notificationsEnabled, setEnabled: setNotificationsEnabled } = useNotificationStore();

  // Get the final site ID for tour completion detection
  const finalSiteId = createdRoute.length > 0 ? createdRoute[createdRoute.length - 1].id : undefined;

  // Reuse the page's GPS — prevents a second watchPosition from running inside the hook
  useProximityNotifications({
    sites: createdRoute as any[],
    onAlert: (alert) => {
      console.log('Arrived at:', alert.siteName);
    },
    finalSiteId,
    onFinalDestinationReached: (siteName) => {
      console.log('Tour complete! Arrived at final destination:', siteName);
    },
    externalUserLocation: userLocation,
  });

  // Capture first GPS fix after tour creation as Mapbox route starting point
  const savedLocationRef = useRef(false);
  useEffect(() => {
    if (!tourCreated || !userLocation || savedLocationRef.current) return;
    savedLocationRef.current = true;
    setSavedLocation(userLocation);
  }, [tourCreated, userLocation]);

  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/locations?orgSlug=southampton');
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

  // Pre-select any sites chosen from the map (tour-builder-store)
  useEffect(() => {
    if (sites.length === 0 || pendingIds.length === 0) return;
    const valid = new Set(pendingIds.filter(id => sites.some(s => s.id === id)));
    if (valid.size > 0) {
      setSelectedIds(valid);
      clearPending();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sites]);

  const totalDistance = useMemo(() => {
    return calculateTotalDistance(createdRoute);
  }, [createdRoute]);

  // Sites filtered by selected curated tour category
  const filteredSites = useMemo(() => {
    if (!categoryFilter) return sites;
    const tour = CURATED_TOURS.find((t) => t.slug === categoryFilter);
    if (!tour) return sites;
    return sites.filter((site) =>
      tour.locations.some((loc) => matchesLocation(site.name, loc))
    );
  }, [sites, categoryFilter]);

  // Pre-computed synchronously — used in <a> tags so iOS never blocks it
  const googleMapsUrl = useMemo(() => {
    if (createdRoute.length === 0) return '';
    const mode = travelMode === 'driving' ? 'driving' : 'walking';
    if (createdRoute.length === 1) {
      const d = createdRoute[0];
      return `https://www.google.com/maps/dir/?api=1&destination=${d.latitude},${d.longitude}&travelmode=${mode}`;
    }
    const dest = createdRoute[createdRoute.length - 1];
    const wps = createdRoute.slice(0, -1).map(s => `${s.latitude},${s.longitude}`).join('|');
    return `https://www.google.com/maps/dir/?api=1&destination=${dest.latitude},${dest.longitude}&waypoints=${encodeURIComponent(wps)}&travelmode=${mode}`;
  }, [createdRoute, travelMode]);

  const nextStop = useMemo(() => {
    if (!userLocation || createdRoute.length === 0) return null;
    let nearest = createdRoute[0];
    let minDist = Infinity;
    createdRoute.forEach(site => {
      const d = calculateDistance(userLocation.latitude, userLocation.longitude, site.latitude, site.longitude);
      if (d < minDist) { minDist = d; nearest = site; }
    });
    return { site: nearest, distanceMeters: minDist, index: createdRoute.indexOf(nearest) };
  }, [userLocation, createdRoute]);

  const activeStepIndex = useMemo(() => {
    if (!userLocation || navSteps.length === 0) return 0;
    let closest = 0;
    let minDist = Infinity;
    navSteps.forEach((step, i) => {
      const loc = step.maneuver.location;
      if (!loc) return;
      const dist = calculateDistance(userLocation.latitude, userLocation.longitude, loc[1], loc[0]);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    return closest;
  }, [userLocation, navSteps]);

  // Speak turn-by-turn directions when active step changes
  useEffect(() => {
    if (!tourCreated || travelMode !== 'walking' || navSteps.length === 0 || !userLocation) return;
    if (activeStepIndex === prevStepRef.current) return;
    prevStepRef.current = activeStepIndex;
    if (activeStepIndex === 0) return; // skip step 0 on initial load
    const step = navSteps[activeStepIndex];
    // Skip arrive/depart steps — arrival is already announced by the proximity system
    const type = step?.maneuver?.type;
    if (type === 'arrive' || type === 'depart') return;
    if (typeof window !== 'undefined' && window.speechSynthesis?.speaking) return;
    speak(step.maneuver.instruction);
  }, [activeStepIndex, tourCreated, travelMode, navSteps, userLocation]);

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
    // Select all visible (filtered) sites
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredSites.forEach((s) => next.add(s.id));
      return next;
    });
  };

  const clearAll = () => {
    setSelectedIds(new Set());
    setTourCreated(false);
    setCreatedRoute([]);
    setMapboxRoute(null);
    setNavSteps([]);
    setMapboxFailed(false);
    setSavedLocation(null);
    savedLocationRef.current = false;
  };

  // Auto-load Mapbox route whenever the tour is created or travel mode changes.
  // This removes the need for any button click — route appears automatically.
  useEffect(() => {
    if (!tourCreated || createdRoute.length < 2) {
      setMapboxRoute(null);
      setNavSteps([]);
      setMapboxFailed(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setNavLoading(true);
      setMapboxFailed(false);
      try {
        const parts: string[] = [];
        if (savedLocation) parts.push(`${savedLocation.longitude},${savedLocation.latitude}`);
        parts.push(...createdRoute.map(s => `${s.longitude},${s.latitude}`));
        const mode = travelMode === 'driving' ? 'driving' : 'walking';
        const res = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/${mode}/${parts.join(';')}?steps=true&geometries=geojson&overview=full&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
        );
        const data = await res.json();
        if (cancelled) return;
        if (data.routes?.length) {
          const r = data.routes[0];
          setMapboxRoute({ type: 'Feature', geometry: r.geometry, properties: {} });
          setNavSteps(r.legs.flatMap((leg: any) => leg.steps ?? []));
        } else {
          setMapboxFailed(true);
        }
      } catch {
        if (!cancelled) setMapboxFailed(true);
      } finally {
        if (!cancelled) setNavLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [tourCreated, createdRoute, travelMode, savedLocation]);

  const createTour = () => {
    warmUpSpeech(); // Unlock iOS audio session on user gesture before GPS starts
    // Create tour immediately — GPS tracking starts in the background
    setCreatedRoute(optimizeRoute(sites.filter((s) => selectedIds.has(s.id)), null));
    setNotificationsEnabled(true);
    setFollowMode(true);
    setTourCreated(true);
    setShowWalkingGif(true);
    setTimeout(() => setShowWalkingGif(false), 3000);
    savedLocationRef.current = false;
    startTracking();
    // On mobile the route section is below the site list — scroll to it
    setTimeout(() => {
      routeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const resetTour = () => {
    setTourCreated(false);
    setCreatedRoute([]);
  };

  const getImageUrl = (storagePath: string) => {
    if (storagePath.startsWith('http') || storagePath.startsWith('/')) {
      return storagePath;
    }
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tour-media/${storagePath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0064b0]">
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
      <Breadcrumb items={[{ label: 'Create Your Tour' }]} />

      {/* Hero */}
      <header className="bg-gradient-to-br from-[#0064b0] to-[#005499] text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3">
            <Route className="w-8 h-8" />
            Create Your Tour
          </h1>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Browse mode selector */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="flex flex-col items-center gap-2 p-4 bg-[#0064b0] rounded-xl border-2 border-[#0064b0] shadow-sm text-center text-white">
            <List className="w-6 h-6" />
            <span className="text-xs font-semibold">Select Sites</span>
          </div>
          <Link
            href="/historic-sites"
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border-2 border-transparent shadow-sm hover:border-[#0064b0] transition-all text-center"
          >
            <Map className="w-6 h-6 text-[#0064b0]" />
            <span className="text-xs font-semibold text-gray-700">View by Map</span>
          </Link>
          <button
            onClick={() => setShowCuratedModal(true)}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border-2 border-transparent shadow-sm hover:border-[#0064b0] transition-all text-center"
          >
            <Bookmark className="w-6 h-6 text-[#0064b0]" />
            <span className="text-xs font-semibold text-gray-700">Curated Tours</span>
          </button>
        </div>

        {/* Curated Tours modal */}
        {showCuratedModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0" onClick={() => setShowCuratedModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h3 className="font-bold text-lg text-gray-900">Choose a Curated Tour</h3>
                <button onClick={() => setShowCuratedModal(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="divide-y">
                {CURATED_TOURS.map((tour) => {
                  const matchCount = sites.filter(s => tour.locations.some(loc => matchesLocation(s.name, loc))).length;
                  return (
                    <button
                      key={tour.slug}
                      onClick={() => {
                        const ids = new Set(
                          sites.filter(s => tour.locations.some(loc => matchesLocation(s.name, loc))).map(s => s.id)
                        );
                        setSelectedIds(ids);
                        setCategoryFilter(null);
                        setShowCuratedModal(false);
                      }}
                      className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 leading-snug">{tour.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{tour.tagline}</p>
                        <p className="text-xs text-[#0064b0] font-medium mt-1">{matchCount} site{matchCount !== 1 ? 's' : ''}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Site Selection */}
          <div className="space-y-4">

            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-600">
                {filteredSites.length} site{filteredSites.length !== 1 ? 's' : ''}
                {categoryFilter ? ' in this theme' : ''} — {selectedIds.size} selected
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
              {filteredSites.map((site) => {
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
                      ${isSelected ? 'border-[#0064b0] shadow-lg' : 'border-transparent hover:border-gray-300'}
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
                          className="data-[state=checked]:bg-[#0064b0] data-[state=checked]:border-[#0064b0]"
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
                          <div className="w-6 h-6 rounded-full bg-[#0064b0] flex items-center justify-center">
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
          <div ref={routeSectionRef} className="lg:sticky lg:top-20 lg:h-[calc(100vh-160px)] space-y-4">
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
                <Route className="w-16 h-16 text-[#0064b0] mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {selectedIds.size} Site{selectedIds.size !== 1 ? 's' : ''} Selected
                </h3>
                <p className="text-gray-500 mb-4">
                  Ready to create your optimized walking tour?
                </p>
                <p className="text-xs text-[#014487] mb-6 flex items-center gap-1">
                  <MapPinned className="w-4 h-4" />
                  GPS will track your position as you walk
                </p>
                <Button
                  size="lg"
                  onClick={createTour}
                  className="bg-[#0064b0] hover:bg-[#005499] text-white gap-2"
                >
                  <Navigation className="w-5 h-5" />
                  Start Walking
                </Button>
              </div>
            ) : (
              <>
                {/* Route Summary */}
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-[#0064b0]" />
                      Your Optimized Route
                    </h3>
                    <Button variant="outline" size="sm" onClick={resetTour}>
                      Edit Selection
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    <div>
                      <span className="text-blue-600 font-medium">Stops:</span>{' '}
                      <span className="font-semibold">{createdRoute.length}</span>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Distance:</span>{' '}
                      <span className="font-semibold">{formatDistanceImperial(totalDistance)}</span>
                    </div>
                    {travelMode === 'walking' ? (
                      <>
                        <div>
                          <span className="text-blue-600 font-medium">Walk:</span>{' '}
                          <span className="font-semibold">{estimateWalkingTime(totalDistance)}</span>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Steps:</span>{' '}
                          <span className="font-semibold">{estimateSteps(totalDistance)}</span>
                        </div>
                      </>
                    ) : (
                      <div>
                        <span className="text-blue-600 font-medium">Drive:</span>{' '}
                        <span className="font-semibold">{estimateDrivingTime(totalDistance)}</span>
                      </div>
                    )}
                  </div>

                  {/* Route Order */}
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Route Order</p>
                    <div className="flex flex-wrap gap-2">
                      {createdRoute.map((site, index) => (
                        <div
                          key={site.id}
                          className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-sm"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#0064b0] text-white text-xs flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="max-w-[120px] truncate">{site.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GPS status */}
                  {userLocation ? (
                    <p className="mt-3 text-xs text-green-600 flex items-center gap-1">
                      <MapPinned className="w-3 h-3" />
                      GPS active — map is following you
                    </p>
                  ) : (
                    <p className="mt-3 text-xs text-amber-600 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Locating you…
                    </p>
                  )}

                  {/* Arrival Notifications & Voice Toggles */}
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <button
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      className="flex items-center gap-2 text-sm w-full"
                    >
                      {notificationsEnabled ? (
                        <Bell className="w-4 h-4 text-[#0064b0]" />
                      ) : (
                        <BellOff className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={notificationsEnabled ? 'text-[#0064b0] font-medium' : 'text-gray-500'}>
                        {notificationsEnabled ? 'Arrival alerts ON' : 'Arrival alerts OFF'}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {notificationsEnabled ? 'Notifies when you reach each site' : 'Tap to enable'}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        const next = !isMuted;
                        setSpeechMuted(next);
                        setMutedState(next);
                        if (!next) speak('Voice is on. You will hear announcements as you walk.');
                      }}
                      className="flex items-center gap-2 text-sm w-full"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-[#0064b0]" />
                      )}
                      <span className={isMuted ? 'text-gray-500' : 'text-[#0064b0] font-medium'}>
                        {isMuted ? 'Voice OFF' : 'Voice ON'}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {isMuted ? 'Tap to enable voice' : 'Arrivals & directions spoken aloud'}
                      </span>
                    </button>
                  </div>

                  {/* Travel mode + directions */}
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600 font-medium">Travel mode:</span>
                      <div className="flex rounded-md border bg-gray-100 p-0.5 gap-0.5">
                        <button
                          onClick={() => setTravelMode('walking')}
                          className={cn(
                            'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
                            travelMode === 'walking' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                          )}
                        >
                          <Footprints className="w-3 h-3" /> Walk
                        </button>
                        <button
                          onClick={() => setTravelMode('driving')}
                          className={cn(
                            'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
                            travelMode === 'driving' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                          )}
                        >
                          <Car className="w-3 h-3" /> Drive
                        </button>
                      </div>
                    </div>
                    {navLoading && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Loading route…
                      </div>
                    )}
                    {travelMode === 'driving' ? (
                      <>
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 bg-[#0064b0] hover:bg-[#005499] text-white rounded-md px-4 h-11 text-sm font-medium"
                        >
                          <Car className="w-5 h-5" />
                          Open Driving Directions
                        </a>
                      </>
                    ) : (
                      <>
                        {mapboxRoute && !navLoading && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            {userLocation ? 'GPS active — map is following you' : 'Route loaded — see map below'}
                          </p>
                        )}
                      </>
                    )}
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

                {/* Walking: nearest stop indicator */}
                {travelMode === 'walking' && nextStop && (
                  <div className="bg-gray-900 text-white rounded-xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0064b0] flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {nextStop.index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Nearest stop</p>
                      <p className="font-semibold text-sm leading-snug mt-0.5">{nextStop.site.name}</p>
                      <p className="text-blue-400 text-sm mt-0.5">{formatDistanceImperial(nextStop.distanceMeters)} away</p>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">{nextStop.index + 1}/{createdRoute.length}</span>
                  </div>
                )}

                {/* Map with GPS follow (walking) or overview (driving) */}
                <div className="relative bg-white rounded-lg shadow-lg overflow-hidden h-[450px] lg:h-[calc(100vh-320px)]">
                  <TourRouteMap
                    key={createdRoute.map(s => s.id).join('-')}
                    sites={createdRoute}
                    hoveredSiteId={hoveredSiteId}
                    routeFeature={mapboxRoute}
                    userLocation={userLocation}
                    heading={heading}
                    followUser={travelMode === 'walking' && followMode}
                    onMapInteract={() => setFollowMode(false)}
                  />
                  {travelMode === 'walking' && !followMode && userLocation && (
                    <button
                      onClick={() => setFollowMode(true)}
                      className="absolute bottom-10 right-3 z-10 bg-white rounded-full shadow-lg p-2.5 border border-gray-200 hover:bg-gray-50"
                      title="Center on my location"
                    >
                      <Navigation className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                </div>

                {/* Walking: collapsible full directions list */}
                {travelMode === 'walking' && navSteps.length > 0 && (
                  <details className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <summary className="px-4 py-3 flex items-center justify-between cursor-pointer select-none">
                      <span className="text-sm font-semibold text-gray-700">All directions ({navSteps.length} steps)</span>
                    </summary>
                    <div className="max-h-52 overflow-y-auto divide-y divide-border text-sm border-t">
                      {navSteps.map((step, i) => (
                        <div key={i} className={`flex items-start gap-3 px-4 py-2.5 ${i === activeStepIndex && userLocation ? 'bg-blue-50' : ''}`}>
                          <span className="w-5 h-5 flex-shrink-0 rounded-full bg-[#0064b0]/10 text-[#0064b0] text-xs flex items-center justify-center font-semibold mt-0.5">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="leading-snug">{step.maneuver.instruction}</p>
                            {step.distance > 0 && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {step.distance < 160 ? `${Math.round(step.distance * 3.281)} ft` : `${(step.distance / 1609.34).toFixed(1)} mi`}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile FAB — visible only when sites selected but tour not yet started */}
      {!tourCreated && selectedIds.size > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
          <button
            onClick={createTour}
            className="w-full flex items-center justify-center gap-2 bg-[#0064b0] text-white rounded-xl py-4 text-base font-semibold shadow-2xl"
          >
            <Navigation className="w-5 h-5" />
            Start Walking · {selectedIds.size} site{selectedIds.size !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Route-aware arrival notification */}
      <TourNotificationContainer createdRoute={createdRoute} userLocation={userLocation} />

      {/* Tour complete prompt - shows after reaching final destination */}
      <TourCompletePromptContainer />
    </div>
  );
}
