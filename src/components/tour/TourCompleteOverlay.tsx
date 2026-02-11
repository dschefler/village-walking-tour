'use client';

import { Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StampCard } from './StampCard';
import type { Site } from '@/types';

interface TourCompleteOverlayProps {
  sites: Site[];
  visitedSiteIds: string[];
  onBrowseSites: () => void;
  onNewTour: () => void;
}

const CONFETTI_COLORS = [
  '#A40000', '#014487', '#FFD700', '#22C55E',
  '#F97316', '#A855F7', '#EC4899', '#06B6D4',
  '#A40000', '#014487', '#FFD700', '#22C55E',
];

export function TourCompleteOverlay({
  sites,
  visitedSiteIds,
  onBrowseSites,
  onNewTour,
}: TourCompleteOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      {/* Confetti pieces */}
      {CONFETTI_COLORS.map((color, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 animate-confetti-fall"
          style={{
            backgroundColor: color,
            left: `${8 + (i * 7.5) % 85}%`,
            top: '-20px',
            borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0',
            '--fall-duration': `${2.5 + (i % 4) * 0.5}s`,
            '--fall-delay': `${(i % 5) * 0.2}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Content card */}
      <div className="relative mx-4 max-w-sm w-full bg-background rounded-2xl shadow-2xl overflow-hidden">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-[#A40000] to-[#014487] px-6 pt-8 pb-6 text-center text-white">
          {/* Trophy + Stars */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <Star
              className="w-6 h-6 text-yellow-300 fill-yellow-300 animate-star-pop"
              style={{ animationDelay: '0.3s', opacity: 0 }}
            />
            <div className="animate-star-pop" style={{ animationDelay: '0.1s', opacity: 0 }}>
              <Trophy className="w-14 h-14 text-yellow-300" />
            </div>
            <Star
              className="w-6 h-6 text-yellow-300 fill-yellow-300 animate-star-pop"
              style={{ animationDelay: '0.5s', opacity: 0 }}
            />
          </div>

          <h2 className="text-2xl font-bold">Tour Complete!</h2>
          <p className="text-sm text-white/80 mt-1">
            You visited all {sites.length} sites
          </p>
        </div>

        {/* Stamp card with shimmer */}
        <div className="relative px-2 py-4">
          <StampCard
            sites={sites}
            visitedSiteIds={visitedSiteIds}
          />
          {/* Shimmer overlay */}
          <div className="absolute inset-0 animate-shimmer pointer-events-none rounded-lg" />
        </div>

        {/* CTA buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onBrowseSites}
          >
            Browse Sites
          </Button>
          <Button
            className="flex-1"
            onClick={onNewTour}
          >
            New Tour
          </Button>
        </div>
      </div>
    </div>
  );
}
