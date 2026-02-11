'use client';

import { useEffect, useState } from 'react';
import { Lightbulb } from 'lucide-react';

interface DidYouKnowPopupProps {
  fact: string;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 6000;

export function DidYouKnowPopup({ fact, onDismiss }: DidYouKnowPopupProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / AUTO_DISMISS_MS, 1);
      setProgress(pct);
      if (pct >= 1) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);
    return () => clearInterval(interval);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Dimmed backdrop */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Card — tappable */}
      <div
        className="relative pointer-events-auto cursor-pointer max-w-sm mx-4 animate-fact-pop"
        onClick={onDismiss}
      >
        <div className="bg-background rounded-2xl shadow-xl p-6 text-center">
          {/* Icon */}
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-amber-500" />
          </div>

          {/* Header */}
          <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-2">
            Did You Know?
          </h3>

          {/* Fact */}
          <p className="text-sm text-foreground leading-relaxed">{fact}</p>

          {/* Tap hint */}
          <p className="mt-3 text-xs text-muted-foreground">Tap to dismiss</p>

          {/* Progress bar */}
          <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-none rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
