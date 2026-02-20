'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { StampCard } from '@/components/tour/StampCard';
import { StampEarnedOverlay } from '@/components/tour/StampEarnedOverlay';
import { TourCompleteOverlay } from '@/components/tour/TourCompleteOverlay';
import { DidYouKnowPopup } from '@/components/tour/DidYouKnowPopup';
import { getFactsForSite } from '@/data/fun-facts';
import { Button } from '@/components/ui/button';
import type { Site } from '@/types';

// Fake sites for the demo
const DEMO_SITES: Site[] = [
  { id: '1', tour_id: 'demo', organization_id: null, name: 'Rogers Memorial Library', description: null, latitude: 0, longitude: 0, audio_url: null, display_order: 1, address: null, address_formatted: null, is_published: true, slug: null, created_at: '', updated_at: '' },
  { id: '2', tour_id: 'demo', organization_id: null, name: 'Southampton History Museum', description: null, latitude: 0, longitude: 0, audio_url: null, display_order: 2, address: null, address_formatted: null, is_published: true, slug: null, created_at: '', updated_at: '' },
  { id: '3', tour_id: 'demo', organization_id: null, name: 'Pelletreau Silver Shop', description: null, latitude: 0, longitude: 0, audio_url: null, display_order: 3, address: null, address_formatted: null, is_published: true, slug: null, created_at: '', updated_at: '' },
  { id: '4', tour_id: 'demo', organization_id: null, name: 'WWI Memorial', description: null, latitude: 0, longitude: 0, audio_url: null, display_order: 4, address: null, address_formatted: null, is_published: true, slug: null, created_at: '', updated_at: '' },
  { id: '5', tour_id: 'demo', organization_id: null, name: 'Agawam Park', description: null, latitude: 0, longitude: 0, audio_url: null, display_order: 5, address: null, address_formatted: null, is_published: true, slug: null, created_at: '', updated_at: '' },
];

export default function DemoPage() {
  const router = useRouter();
  const [visitedIds, setVisitedIds] = useState<string[]>([]);
  const [justStampedId, setJustStampedId] = useState<string | null>(null);
  const [showStampEarned, setShowStampEarned] = useState(false);
  const [stampedOrder, setStampedOrder] = useState(1);
  const [showTourComplete, setShowTourComplete] = useState(false);
  const [showDidYouKnow, setShowDidYouKnow] = useState(false);
  const [currentFact, setCurrentFact] = useState('');
  const [shownFactIndices, setShownFactIndices] = useState<Record<string, number[]>>({});

  const showFactForSite = useCallback((siteName: string) => {
    const facts = getFactsForSite(siteName);
    if (facts.length === 0) return;
    const shown = shownFactIndices[siteName] || [];
    const unseen = facts.map((_, i) => i).filter((i) => !shown.includes(i));
    if (unseen.length === 0) return;
    const pick = unseen[Math.floor(Math.random() * unseen.length)];
    setShownFactIndices((prev) => ({
      ...prev,
      [siteName]: [...(prev[siteName] || []), pick],
    }));
    setCurrentFact(facts[pick]);
    setShowDidYouKnow(true);
  }, [shownFactIndices]);

  const visitNext = useCallback(() => {
    const nextSite = DEMO_SITES.find((s) => !visitedIds.includes(s.id));
    if (!nextSite) return;

    const newVisited = [...visitedIds, nextSite.id];
    setVisitedIds(newVisited);
    setJustStampedId(nextSite.id);
    setStampedOrder(nextSite.display_order);
    setShowStampEarned(true);

    // Clear bounce animation after it plays
    setTimeout(() => setJustStampedId(null), 600);

    // Show fact after stamp overlay dismisses
    setTimeout(() => showFactForSite(nextSite.name), 2400);

    // If that was the last one, show tour complete after stamp overlay
    if (newVisited.length >= DEMO_SITES.length) {
      setTimeout(() => setShowTourComplete(true), 2400);
    }
  }, [visitedIds, showFactForSite]);

  const reset = () => {
    setVisitedIds([]);
    setJustStampedId(null);
    setShowStampEarned(false);
    setShowTourComplete(false);
    setShowDidYouKnow(false);
    setCurrentFact('');
    setShownFactIndices({});
  };

  const nextSite = DEMO_SITES.find((s) => !visitedIds.includes(s.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Header with stamp card */}
      <header className="bg-background border-b">
        <div className="px-4 py-3">
          <h1 className="font-semibold text-lg">Celebration Demo</h1>
          <p className="text-sm text-muted-foreground">
            Tap the button below to simulate arriving at each site
          </p>
        </div>
        <StampCard
          sites={DEMO_SITES}
          visitedSiteIds={visitedIds}
          justStampedSiteId={justStampedId}
        />
      </header>

      {/* Controls */}
      <div className="p-6 space-y-4 max-w-md mx-auto">
        <Button
          className="w-full text-lg py-6"
          onClick={visitNext}
          disabled={!nextSite}
        >
          {nextSite
            ? `Arrive at Site #${nextSite.display_order}: ${nextSite.name}`
            : 'All sites visited!'}
        </Button>

        <Button variant="outline" className="w-full" onClick={reset}>
          Reset Demo
        </Button>

        <div className="border-t pt-4 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Quick triggers:</p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setStampedOrder(1);
                setShowStampEarned(true);
              }}
            >
              Show Stamp Overlay
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setVisitedIds(DEMO_SITES.map((s) => s.id));
                setShowTourComplete(true);
              }}
            >
              Show Tour Complete
            </Button>
          </div>
        </div>
      </div>

      {/* Overlays */}
      {showStampEarned && (
        <StampEarnedOverlay
          siteOrder={stampedOrder}
          visitedCount={visitedIds.length}
          totalSites={DEMO_SITES.length}
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
          sites={DEMO_SITES}
          visitedSiteIds={visitedIds}
          onBrowseSites={() => setShowTourComplete(false)}
          onNewTour={() => {
            setShowTourComplete(false);
            reset();
          }}
        />
      )}
    </div>
  );
}
