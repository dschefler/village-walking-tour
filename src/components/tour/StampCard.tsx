'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Site } from '@/types';

interface StampCardProps {
  sites: Site[];
  visitedSiteIds: string[];
  justStampedSiteId?: string | null;
  className?: string;
}

export function StampCard({
  sites,
  visitedSiteIds,
  justStampedSiteId,
  className,
}: StampCardProps) {
  const sorted = [...sites].sort((a, b) => a.display_order - b.display_order);
  const visitedCount = visitedSiteIds.length;

  return (
    <div className={cn('px-4 py-2', className)}>
      {/* Stamp row */}
      <div className="flex items-center overflow-x-auto scrollbar-hide gap-0">
        {sorted.map((site, i) => {
          const isVisited = visitedSiteIds.includes(site.id);
          const isJustStamped = justStampedSiteId === site.id;
          const prevVisited = i > 0 && visitedSiteIds.includes(sorted[i - 1].id);

          return (
            <div key={site.id} className="flex items-center flex-shrink-0">
              {/* Connecting line (before each stamp except first) */}
              {i > 0 && (
                <div
                  className={cn(
                    'h-0.5 w-4 sm:w-6 transition-colors duration-500',
                    prevVisited && isVisited
                      ? 'bg-primary'
                      : 'bg-muted-foreground/20'
                  )}
                />
              )}

              {/* Stamp circle */}
              <div
                className={cn(
                  'relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs font-bold transition-all duration-300',
                  isVisited
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'border-2 border-dashed border-muted-foreground/40 text-muted-foreground',
                  isJustStamped && 'animate-stamp-bounce'
                )}
              >
                {isVisited ? (
                  <Check className="w-4 h-4" strokeWidth={3} />
                ) : (
                  <span>{site.display_order}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Count text */}
      <p className="text-xs text-muted-foreground mt-1.5 text-center">
        {visitedCount}/{sites.length} collected
      </p>
    </div>
  );
}
