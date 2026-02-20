'use client';

import { useEffect } from 'react';
import { Stamp } from 'lucide-react';
import { useTenantOptional } from '@/lib/context/tenant-context';

interface StampEarnedOverlayProps {
  siteOrder: number;
  visitedCount: number;
  totalSites: number;
  onDismiss: () => void;
}

const PARTICLE_OFFSETS = [
  { x: -60, y: -50, rotate: -20 },
  { x: 60, y: -40, rotate: 15 },
  { x: -50, y: 50, rotate: 30 },
  { x: 55, y: 45, rotate: -25 },
];

export function StampEarnedOverlay({
  siteOrder,
  visitedCount,
  totalSites,
  onDismiss,
}: StampEarnedOverlayProps) {
  const tenant = useTenantOptional();
  const primary = tenant?.organization.primary_color ?? '#A40000';
  const secondary = tenant?.organization.secondary_color ?? '#014487';
  const colors = [primary, secondary, '#FFD700', '#22C55E'];

  useEffect(() => {
    const timer = setTimeout(onDismiss, 2200);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Dimmed backdrop */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative flex flex-col items-center">
        {/* Particle bursts */}
        {PARTICLE_OFFSETS.map((offset, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full animate-confetti-burst"
            style={{
              backgroundColor: colors[i],
              left: '50%',
              top: '50%',
              marginLeft: -6,
              marginTop: -6,
              animation: `confetti-burst 0.8s ease-out forwards`,
              transform: `translate(${offset.x}px, ${offset.y}px) rotate(${offset.rotate}deg)`,
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}

        {/* Wax seal stamp */}
        <div className="animate-stamp-bounce">
          <div className="w-20 h-20 rounded-full bg-primary shadow-lg flex items-center justify-center ring-4 ring-primary/30">
            <Stamp className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>

        {/* Text */}
        <p className="mt-4 text-lg font-bold text-foreground bg-background/90 px-4 py-1.5 rounded-full shadow-sm">
          Site #{siteOrder} Collected!
        </p>
        <p className="mt-1 text-sm text-muted-foreground bg-background/90 px-3 py-1 rounded-full">
          {visitedCount}/{totalSites}
        </p>
      </div>
    </div>
  );
}
