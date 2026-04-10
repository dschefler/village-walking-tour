'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export async function clearPageCaches() {
  if (!('caches' in window)) return;
  const names = await caches.keys();
  await Promise.all(
    names
      .filter(n => !n.includes('mapbox') && !n.includes('audio'))
      .map(n => caches.delete(n))
  );
}

// Handles code deployment updates via service worker controllerchange.
// For data-content updates (new tour stops), use ContentVersionChecker.
export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // When the SW controller changes (new SW took over), show prompt
    const handleControllerChange = () => setShowPrompt(true);
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // Also watch for a new SW installing and becoming "installed" (waiting)
    const watchRegistration = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting) {
        // There's already a waiting SW — prompt immediately
        setShowPrompt(true);
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        return;
      }
      reg.addEventListener('updatefound', () => {
        const incoming = reg.installing;
        if (!incoming) return;
        incoming.addEventListener('statechange', () => {
          if (incoming.state === 'installed' && navigator.serviceWorker.controller) {
            // New SW installed and waiting — tell it to skip waiting
            reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
            setShowPrompt(true);
          }
        });
      });
    };

    // Check existing registration immediately
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg) watchRegistration(reg);
    });

    // Periodically check for updates (every 30 min)
    const interval = setInterval(() => {
      navigator.serviceWorker.getRegistration().then(reg => reg?.update());
    }, 30 * 60 * 1000);

    // Also check on tab focus (catches long-idle tabs)
    const handleFocus = () => {
      navigator.serviceWorker.getRegistration().then(reg => reg?.update());
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  async function handleRefresh() {
    await clearPageCaches();
    window.location.reload();
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-primary text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 text-sm font-medium">
        <RefreshCw className="w-4 h-4 shrink-0" />
        App updated — tap Refresh to load the latest version.
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" variant="secondary" onClick={handleRefresh} className="h-7 text-xs font-semibold">
          Refresh
        </Button>
        <button onClick={() => setShowPrompt(false)} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
