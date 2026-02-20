'use client';

import { Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StampCard } from './StampCard';
import { useTenantOptional } from '@/lib/context/tenant-context';
import type { Site } from '@/types';

interface TourCompleteOverlayProps {
  sites: Site[];
  visitedSiteIds: string[];
  onBrowseSites: () => void;
  onNewTour: () => void;
}

const EXTRA_CONFETTI = ['#FFD700', '#22C55E', '#F97316', '#A855F7', '#EC4899', '#06B6D4'];

export function TourCompleteOverlay({
  sites,
  visitedSiteIds,
  onBrowseSites,
  onNewTour,
}: TourCompleteOverlayProps) {
  const tenant = useTenantOptional();
  const primaryColor = tenant?.organization.primary_color ?? '#A40000';
  const secondaryColor = tenant?.organization.secondary_color ?? '#014487';

  const confettiColors = [
    primaryColor, secondaryColor,
    ...EXTRA_CONFETTI,
    primaryColor, secondaryColor,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      {/* Confetti pieces */}
      {confettiColors.map((color, i) => (
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
        {/* Gradient header — uses org colors */}
        <div
          className="px-6 pt-8 pb-6 text-center text-white"
          style={{
            background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
          }}
        >
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
