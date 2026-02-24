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
import { useTenantOptional } from '@/lib/context/tenant-context';
import { useTourStore } from '@/stores/tour-store';
import { getTourFromCacheOrNetwork, syncTourForOffline } from '@/lib/offline/sync';
import { cn, formatDistance, calculateDistance } from '@/lib/utils';
import { useGeolocation } from '@/hooks/use-geolocation';
import type { TourWithSites, Site, SiteWithMedia, FunFact } from '@/types';

type ViewMode = 'map' | 'list';

export default function TenantTourPage() {
  const params = useParams();
  const router = useRouter();
  const tourId = params.tourId as string;
  const orgSlug = params.orgSlug as string;

  const tenant = useTenantOptional();
  const orgName = tenant?.organization.name ?? '';
  const orgLogoUrl = tenant?.organization.icon_url || tenant?.organization.logo_url || '/logo.png';

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
  const [shownFactIndices, setShownFactIndices] = useState<Record<string, number[]>>({});

  // Fun facts from DB keyed by site_id
  const [factsBySite, setFactsBySite] = useState<Record<string, string[]>>({});

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

  const { userLocation } = useGeolocation();

  // Load fun facts from DB
  useEffect(() => {
    async function loadFacts() {
      try {
        const res = await fetch(`/api/fun-facts?tourId=${tourId}`);
        if (res.ok) {
          const facts: FunFact[] = await res.json();
          const grouped: Record<string, string[]> = {};
          for (const f of facts) {
            if (!grouped[f.site_id]) grouped[f.site_id] = [];
            grouped[f.site_id].push(f.fact_text);
          }
          setFactsBySite(grouped);
        }
      } catch {
        // Fun facts are optional — fail silently
      }
    }
    loadFacts();
  }, [tourId]);

  const getFactsForSite = useCallback(
    (siteId: string): string[] => factsBySite[siteId] || [],
    [factsBySite]
  );

  const showFactForSite = useCallback((siteId: string) => {
    const facts = getFactsForSite(siteId);
    if (facts.length === 0) return;
    const shown = shownFactIndices[siteId] || [];
    const unseen = facts.map((_, i) => i).filter((i) => !shown.includes(i));
    if (unseen.length === 0) return;
    const pick = unseen[Math.floor(Math.random() * unseen.length)];
    setShownFactIndices((prev) => ({
      ...prev,
      [siteId]: [...(prev[siteId] || []), pick],
    }));
    setCurrentFact(facts[pick]);
    setShowDidYouKnow(true);
  }, [getFactsForSite, shownFactIndices]);

  // Fetch tour data
  useEffect(() => {
    async function loadTour() {
      try {
        setLoading(true);
        const tourData = await getTourFromCacheOrNetwork(tourId);
        if (tourData) {
          setTour(tourData);
          setCurrentTour(tourData);
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

  const triggerStampCelebration = useCallback(
    (siteId: string) => {
      if (!tour) return;
      const progress = tourProgress[tour.id];
      const alreadyVisited = progress?.visitedSites.includes(siteId);
      if (alreadyVisited) return;

      const site = tour.sites.find((s) => s.id === siteId);
      if (!site) return;

      markSiteVisited(tour.id, siteId);
      setJustStampedSiteId(siteId);
      setStampedSiteOrder(site.display_order);
      setShowStampEarned(true);

      const newVisitedCount = (progress?.visitedSites.length || 0) + 1;
      if (newVisitedCount >= tour.sites.length) {
        completeTour(tour.id);
        setTimeout(() => setShowTourComplete(true), 2400);
      }

      setTimeout(() => showFactForSite(siteId), 2400);
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
        showFactForSite(site.id);
      }
    }
  };

  // Watch for GPS-triggered visits
  useEffect(() => {
    if (lastVisitedSiteId && tour) {
      const progress = tourProgress[tour.id];
      const justVisited = progress?.visitedSites.includes(lastVisitedSiteId);
      if (justVisited) {
        const site = tour.sites.find((s) => s.id === lastVisitedSiteId);
        if (site) {
          setJustStampedSiteId(lastVisitedSiteId);
          setStampedSiteOrder(site.display_order);
          setShowStampEarned(true);

          if (progress && progress.visitedSites.length >= tour.sites.length) {
            completeTour(tour.id);
            setTimeout(() => setShowTourComplete(true), 2400);
          }
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
          <Link href={`/t/${orgSlug}`}>Back to Home</Link>
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
            <Link href={`/t/${orgSlug}`} className="flex items-center gap-2">
              <Image
                src={orgLogoUrl}
                alt={orgName || 'Walking Tour'}
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
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className={cn('flex-1', viewMode === 'list' && 'hidden md:block')}>
          <TourMap
            sites={tour.sites}
            onSiteClick={handleSiteClick}
            className="h-full"
          />
        </div>

        <div
          className={cn(
            'md:w-96 md:border-l overflow-y-auto bg-background',
            viewMode === 'map' && 'hidden md:block'
          )}
        >
          <div className="p-4 space-y-4">
            <div className="md:hidden">
              <SyncButton onSync={handleSync} isSyncing={isSyncing} className="w-full justify-center" />
            </div>

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

              {selectedSiteWithMedia.media.filter((m) => m.file_type === 'image').length > 0 && (
                <ImageGallery
                  images={selectedSiteWithMedia.media.filter((m) => m.file_type === 'image')}
                  className="mb-4"
                />
              )}

              {selectedSiteWithMedia.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedSiteWithMedia.description}
                </p>
              )}

              {selectedSiteWithMedia.audio_url && (
                <AudioPlayer
                  audioUrl={selectedSiteWithMedia.audio_url}
                  siteId={selectedSiteWithMedia.id}
                  siteName={selectedSiteWithMedia.name}
                  className="mb-4"
                />
              )}

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

      <MiniAudioPlayer className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-64 z-20" />

      {showStampEarned && (
        <StampEarnedOverlay
          siteOrder={stampedSiteOrder}
          visitedCount={visitedCount}
          totalSites={totalSites}
          onDismiss={() => setShowStampEarned(false)}
        />
      )}

      {showDidYouKnow && (
        <DidYouKnowPopup
          fact={currentFact}
          onDismiss={() => setShowDidYouKnow(false)}
        />
      )}

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
            router.push(`/t/${orgSlug}`);
          }}
        />
      )}
    </div>
  );
}
