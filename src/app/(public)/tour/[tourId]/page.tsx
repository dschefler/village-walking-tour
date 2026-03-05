'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  List,
  Map as MapIcon,
  Check,
  ChevronRight,
  Share2,
  Navigation,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TourMap } from '@/components/map/TourMap';
import { AudioPlayer, MiniAudioPlayer } from '@/components/audio/AudioPlayer';
import { ImageGallery } from '@/components/gallery/ImageGallery';
import { SyncButton } from '@/components/pwa/OfflineIndicator';
import { StampCard } from '@/components/tour/StampCard';
import { StampEarnedOverlay } from '@/components/tour/StampEarnedOverlay';
import { TourCompleteOverlay } from '@/components/tour/TourCompleteOverlay';
import { DidYouKnowPopup } from '@/components/tour/DidYouKnowPopup';
import { useTourStore } from '@/stores/tour-store';
import { getTourFromCacheOrNetwork, syncTourForOffline } from '@/lib/offline/sync';
import { cn, formatDistance, formatDuration, calculateDistance, calculateWalkingTime, formatWalkingTime } from '@/lib/utils';
import { useGeolocation } from '@/hooks/use-geolocation';
import type { TourWithSites, Site, SiteWithMedia, FunFact } from '@/types';

type ViewMode = 'map' | 'list';

export default function TourPage() {
  const params = useParams();
  const router = useRouter();
  const tourId = params.tourId as string;

  const [tour, setTour] = useState<TourWithSites | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [isSyncing, setIsSyncing] = useState(false);

  const [justStampedSiteId, setJustStampedSiteId] = useState<string | null>(null);
  const [showStampEarned, setShowStampEarned] = useState(false);
  const [stampedSiteOrder, setStampedSiteOrder] = useState(1);
  const [showTourComplete, setShowTourComplete] = useState(false);

  const [showDidYouKnow, setShowDidYouKnow] = useState(false);
  const [currentFact, setCurrentFact] = useState('');
  const [currentFactAudioUrl, setCurrentFactAudioUrl] = useState<string | null>(null);
  const [shownFactIndices, setShownFactIndices] = useState<Record<string, number[]>>({});

  // In-app navigation mode
  const [navigatingToSite, setNavigatingToSite] = useState<Site | null>(null);

  // Fun facts from DB keyed by site_id
  const [factsBySite, setFactsBySite] = useState<Record<string, { text: string; audioUrl: string | null }[]>>({});

  const {
    selectedSite,
    setSelectedSite,
    setCurrentTour,
    tourProgress,
    markSiteVisited,
    startTour,
    completeTour,
    lastVisitedSiteId,
    clearLastVisited,
  } = useTourStore();

  const { userLocation, getCurrentPosition } = useGeolocation();

  // Load fun facts from DB (keyed by site_id)
  useEffect(() => {
    async function loadFacts() {
      if (!tourId) return;
      try {
        const res = await fetch(`/api/fun-facts?tourId=${tourId}`);
        if (res.ok) {
          const facts: FunFact[] = await res.json();
          const grouped: Record<string, { text: string; audioUrl: string | null }[]> = {};
          for (const f of facts) {
            if (!grouped[f.site_id]) grouped[f.site_id] = [];
            grouped[f.site_id].push({ text: f.fact_text, audioUrl: f.audio_url || null });
          }
          setFactsBySite(grouped);
        }
      } catch {
        // Fun facts are optional — fail silently
      }
    }
    loadFacts();
  }, [tourId]);

  const showFactForSite = useCallback((siteId: string) => {
    const facts = factsBySite[siteId] || [];
    if (facts.length === 0) return;
    const shown = shownFactIndices[siteId] || [];
    const unseen = facts.map((_, i) => i).filter((i) => !shown.includes(i));
    if (unseen.length === 0) return;
    const pick = unseen[Math.floor(Math.random() * unseen.length)];
    setShownFactIndices((prev) => ({
      ...prev,
      [siteId]: [...(prev[siteId] || []), pick],
    }));
    setCurrentFact(facts[pick].text);
    setCurrentFactAudioUrl(facts[pick].audioUrl);
    setShowDidYouKnow(true);
  }, [factsBySite, shownFactIndices]);

  // Fetch tour data
  useEffect(() => {
    async function loadTour() {
      try {
        setLoading(true);
        const tourData = await getTourFromCacheOrNetwork(tourId);
        if (tourData) {
          setTour(tourData);
          setCurrentTour(tourData);
          // Start tour progress if not already started
          if (!tourProgress[tourData.id]) {
            startTour(tourData.id);
          }
        } else {
          setError('Tour not found');
        }
      } catch (err) {
        setError('Failed to load tour');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadTour();
  }, [tourId, setCurrentTour, tourProgress, startTour]);

  const handleSync = async () => {
    if (!tour) return;
    setIsSyncing(true);
    try {
      await syncTourForOffline(tour.id);
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleShare = async () => {
    if (!tour) return;
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: tour.name,
        text: tour.description || 'Check out this walking tour!',
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const buildMapsUrl = (target: Site, lat?: number, lng?: number): string => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isMac = /Macintosh/.test(navigator.userAgent);
    const origin = lat && lng ? `${lat},${lng}` : '';
    if (isIOS || isMac) {
      return origin
        ? `maps://maps.apple.com/?saddr=${origin}&daddr=${target.latitude},${target.longitude}&dirflg=w`
        : `maps://maps.apple.com/?daddr=${target.latitude},${target.longitude}&dirflg=w`;
    }
    return origin
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${target.latitude},${target.longitude}&travelmode=walking`
      : `https://www.google.com/maps/dir/?api=1&destination=${target.latitude},${target.longitude}&travelmode=walking`;
  };

  const handleStartWalking = async () => {
    if (!tour) return;

    // Try to get GPS — silently fall back to Stop 1 if denied/unavailable
    let lat = userLocation?.latitude;
    let lng = userLocation?.longitude;
    if (!lat || !lng) {
      try {
        const pos = await getCurrentPosition();
        lat = pos.latitude;
        lng = pos.longitude;
      } catch {
        // Permission denied or unavailable — will navigate to Stop 1 below
      }
    }

    const visited = tourProgress[tour.id]?.visitedSites || [];
    const unvisited = tour.sites.filter((s) => !visited.includes(s.id));
    const candidates = unvisited.length > 0 ? unvisited : tour.sites;

    // Pick nearest unvisited stop if we have GPS, otherwise pick Stop 1 (by display_order)
    let target = [...candidates].sort((a, b) => a.display_order - b.display_order)[0];
    if (lat && lng) {
      target = candidates.reduce((nearest, site) => {
        const d = calculateDistance(lat!, lng!, site.latitude, site.longitude);
        const nd = calculateDistance(lat!, lng!, nearest.latitude, nearest.longitude);
        return d < nd ? site : nearest;
      });
    }

    // Activate in-app navigation mode
    setNavigatingToSite(target);
  };

  const triggerStampCelebration = useCallback(
    (siteId: string) => {
      if (!tour) return;
      const progress = tourProgress[tour.id];
      const alreadyVisited = progress?.visitedSites.includes(siteId);
      if (alreadyVisited) return;

      const site = tour.sites.find((s) => s.id === siteId);
      if (!site) return;

      // Mark visited in store
      markSiteVisited(tour.id, siteId);

      // Trigger stamp animation
      setJustStampedSiteId(siteId);
      setStampedSiteOrder(site.display_order);
      setShowStampEarned(true);

      // Check if this completes the tour
      const newVisitedCount = (progress?.visitedSites.length || 0) + 1;
      if (newVisitedCount >= tour.sites.length) {
        completeTour(tour.id);
        // Show tour complete after stamp overlay dismisses
        setTimeout(() => setShowTourComplete(true), 2400);
      }

      // Show fact after stamp overlay dismisses (2.2s)
      setTimeout(() => showFactForSite(site.id), 2400);

      // Clear stamp animation after it plays
      setTimeout(() => setJustStampedSiteId(null), 600);
    },
    [tour, tourProgress, markSiteVisited, completeTour, showFactForSite]
  );

  const handleSiteClick = (site: Site) => {
    setSelectedSite(site);
    if (tour) {
      const progress = tourProgress[tour.id];
      const alreadyVisited = progress?.visitedSites.includes(site.id);
      if (!alreadyVisited) {
        triggerStampCelebration(site.id);
      } else {
        // Already visited — show a fact
        showFactForSite(site.id);
      }
    }
  };

  // Auto-arrival detection: stamp + advance to next stop when within 50m
  useEffect(() => {
    if (!navigatingToSite || !userLocation || !tour) return;

    const dist = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      navigatingToSite.latitude,
      navigatingToSite.longitude
    );

    if (dist <= 50) {
      // Arrived — trigger stamp celebration
      triggerStampCelebration(navigatingToSite.id);

      // Advance to next unvisited stop (after a brief pause for celebration)
      setTimeout(() => {
        const visited = tourProgress[tour.id]?.visitedSites || [];
        const nextVisited = [...visited, navigatingToSite.id];
        const nextStop = tour.sites
          .filter((s) => !nextVisited.includes(s.id))
          .sort((a, b) => a.display_order - b.display_order)[0];
        if (nextStop) {
          setNavigatingToSite(nextStop);
        } else {
          // All stops visited — end navigation mode
          setNavigatingToSite(null);
        }
      }, 2600);
    }
  }, [userLocation, navigatingToSite, tour, tourProgress, triggerStampCelebration]);

  // Watch for GPS-triggered visits via lastVisitedSiteId
  useEffect(() => {
    if (lastVisitedSiteId && tour) {
      const progress = tourProgress[tour.id];
      const justVisited = progress?.visitedSites.includes(lastVisitedSiteId);
      if (justVisited) {
        // The store already marked it visited; trigger celebration UI
        const site = tour.sites.find((s) => s.id === lastVisitedSiteId);
        if (site) {
          setJustStampedSiteId(lastVisitedSiteId);
          setStampedSiteOrder(site.display_order);
          setShowStampEarned(true);

          if (progress && progress.visitedSites.length >= tour.sites.length) {
            completeTour(tour.id);
            setTimeout(() => setShowTourComplete(true), 2400);
          }
          // Show fact after stamp overlay
          setTimeout(() => showFactForSite(site.id), 2400);
          setTimeout(() => setJustStampedSiteId(null), 600);
        }
      }
      clearLastVisited();
    }
  }, [lastVisitedSiteId, tour, tourProgress, clearLastVisited, completeTour, showFactForSite]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-semibold mb-2">Tour Not Found</h1>
        <p className="text-muted-foreground mb-4">{error || 'This tour could not be found.'}</p>
        <Button asChild>
          <Link href="/">Back to Tours</Link>
        </Button>
      </div>
    );
  }

  const progress = tourProgress[tour.id];
  const visitedCount = progress?.visitedSites.length || 0;
  const totalSites = tour.sites.length;

  const selectedSiteWithMedia = tour.sites.find(
    (s) => s.id === selectedSite?.id
  ) as SiteWithMedia | undefined;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-background border-b safe-area-inset-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Village of Southampton"
                width={40}
                height={40}
                className="rounded-full"
              />
            </Link>
            <div>
              <h1 className="font-semibold">{tour.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
            <SyncButton onSync={handleSync} isSyncing={isSyncing} className="hidden md:flex" />
          </div>
        </div>
        <StampCard
          sites={tour.sites}
          visitedSiteIds={progress?.visitedSites || []}
          justStampedSiteId={justStampedSiteId}
        />

        {/* Navigation bar */}
        {navigatingToSite ? (
          <div className="border-t bg-primary text-primary-foreground px-4 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Navigation className="w-4 h-4 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight truncate">
                    Stop {navigatingToSite.display_order}: {navigatingToSite.name}
                  </p>
                  {userLocation && (() => {
                    const dist = calculateDistance(
                      userLocation.latitude,
                      userLocation.longitude,
                      navigatingToSite.latitude,
                      navigatingToSite.longitude
                    );
                    const mins = calculateWalkingTime(dist);
                    return (
                      <p className="text-xs opacity-80">
                        {formatDistance(dist)} · {formatWalkingTime(mins)}
                      </p>
                    );
                  })()}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={buildMapsUrl(
                    navigatingToSite,
                    userLocation?.latitude,
                    userLocation?.longitude
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline opacity-80 hover:opacity-100 whitespace-nowrap"
                >
                  Open in Maps
                </a>
                <button
                  onClick={() => setNavigatingToSite(null)}
                  className="opacity-70 hover:opacity-100 p-0.5"
                  aria-label="Cancel navigation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-2 border-t bg-primary/5">
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/80 gap-2"
              onClick={handleStartWalking}
            >
              <Navigation className="w-4 h-4" />
              {(tourProgress[tour.id]?.visitedSites.length || 0) > 0
                ? 'Navigate to Next Stop'
                : 'Start Walking Tour'}
            </Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Map/List View */}
        <div className={cn('flex-1', viewMode === 'list' && 'hidden md:block')}>
          <TourMap
            sites={tour.sites}
            onSiteClick={handleSiteClick}
            className="h-full"
          />
        </div>

        {/* Site List (mobile: full screen, desktop: sidebar) */}
        <div
          className={cn(
            'md:w-96 md:border-l overflow-y-auto bg-background',
            viewMode === 'map' && 'hidden md:block'
          )}
        >
          <div className="p-4 space-y-4">
            {/* Mobile sync button */}
            <div className="md:hidden">
              <SyncButton onSync={handleSync} isSyncing={isSyncing} className="w-full justify-center" />
            </div>

            {/* Sites List */}
            <div className="space-y-3">
              {tour.sites
                .sort((a, b) => a.display_order - b.display_order)
                .map((site) => {
                  const isVisited = progress?.visitedSites.includes(site.id);
                  const isSelected = selectedSite?.id === site.id;
                  const distance = userLocation
                    ? calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        site.latitude,
                        site.longitude
                      )
                    : null;

                  return (
                    <Card
                      key={site.id}
                      className={cn(
                        'cursor-pointer transition-all',
                        isSelected && 'ring-2 ring-primary',
                        isVisited && 'bg-muted/50'
                      )}
                      onClick={() => handleSiteClick(site)}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                              {site.display_order}
                            </span>
                            <CardTitle className="text-base">{site.name}</CardTitle>
                          </div>
                          <div
                            className={cn(
                              'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                              isVisited
                                ? 'bg-primary text-primary-foreground'
                                : 'border-2 border-dashed border-muted-foreground/40 text-muted-foreground'
                            )}
                          >
                            {isVisited ? (
                              <Check className="w-3.5 h-3.5" strokeWidth={3} />
                            ) : (
                              <span>{site.display_order}</span>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {site.description && (
                          <CardDescription className="line-clamp-2 mb-2">
                            {site.description}
                          </CardDescription>
                        )}
                        {distance !== null && (
                          <p className="text-xs text-muted-foreground">
                            {formatDistance(distance)} away
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Selected Site Detail Panel */}
        {selectedSiteWithMedia && (
          <div className="fixed inset-x-0 bottom-0 md:absolute md:inset-auto md:bottom-4 md:left-4 md:right-auto md:w-96 bg-background border-t md:border md:rounded-lg shadow-lg max-h-[60vh] overflow-y-auto safe-area-inset-bottom z-10">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{selectedSiteWithMedia.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSite(null)}
                >
                  Close
                </Button>
              </div>

              {/* Image Gallery */}
              {selectedSiteWithMedia.media.filter((m) => m.file_type === 'image').length > 0 && (
                <ImageGallery
                  images={selectedSiteWithMedia.media.filter((m) => m.file_type === 'image')}
                  className="mb-4"
                />
              )}

              {/* Description */}
              {selectedSiteWithMedia.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedSiteWithMedia.description}
                </p>
              )}

              {/* Audio Player */}
              {selectedSiteWithMedia.audio_url && (
                <AudioPlayer
                  audioUrl={selectedSiteWithMedia.audio_url}
                  siteId={selectedSiteWithMedia.id}
                  siteName={selectedSiteWithMedia.name}
                  className="mb-4"
                />
              )}

              {/* Navigation */}
              <Button
                className="w-full"
                onClick={() => {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedSiteWithMedia.latitude},${selectedSiteWithMedia.longitude}&travelmode=walking`;
                  window.open(url, '_blank');
                }}
              >
                Navigate to this site
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile View Toggle */}
      <div className="md:hidden flex-shrink-0 border-t bg-background safe-area-inset-bottom">
        <div className="flex">
          <button
            onClick={() => setViewMode('map')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3',
              viewMode === 'map' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <MapIcon className="w-5 h-5" />
            <span>Map</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3',
              viewMode === 'list' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <List className="w-5 h-5" />
            <span>Sites</span>
          </button>
        </div>
      </div>

      {/* Mini Audio Player */}
      <MiniAudioPlayer className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-64 z-20" />

      {/* Per-site celebration overlay */}
      {showStampEarned && (
        <StampEarnedOverlay
          siteOrder={stampedSiteOrder}
          visitedCount={visitedCount}
          totalSites={totalSites}
          onDismiss={() => setShowStampEarned(false)}
        />
      )}

      {/* "Did You Know?" fact popup */}
      {showDidYouKnow && (
        <DidYouKnowPopup
          fact={currentFact}
          audioUrl={currentFactAudioUrl}
          onDismiss={() => setShowDidYouKnow(false)}
        />
      )}

      {/* Tour completion celebration */}
      {showTourComplete && (
        <TourCompleteOverlay
          sites={tour.sites}
          visitedSiteIds={progress?.visitedSites || []}
          onBrowseSites={() => {
            setShowTourComplete(false);
            setViewMode('list');
          }}
          onNewTour={() => {
            setShowTourComplete(false);
            router.push('/');
          }}
        />
      )}
    </div>
  );
}
