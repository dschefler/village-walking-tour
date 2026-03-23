'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Fires when a new service worker takes control (skipWaiting: true means this
    // happens automatically after every new deployment)
    const handleControllerChange = () => {
      setShowPrompt(true);
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  async function handleRefresh() {
    // Clear page/app caches so fresh data loads — keep mapbox tiles and audio
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(n => !n.includes('mapbox') && !n.includes('audio'))
          .map(n => caches.delete(n))
      );
    }
    window.location.reload();
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-primary text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 text-sm font-medium">
        <RefreshCw className="w-4 h-4 shrink-0" />
        New content available — tap to load the latest stops.
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleRefresh}
          className="h-7 text-xs font-semibold"
        >
          Refresh
        </Button>
        <button
          onClick={() => setShowPrompt(false)}
          aria-label="Dismiss"
          className="opacity-70 hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
