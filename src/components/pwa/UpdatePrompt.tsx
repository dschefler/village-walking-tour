'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VERSION_KEY = 'swt-content-version';

async function clearPageCaches() {
  if (!('caches' in window)) return;
  const names = await caches.keys();
  await Promise.all(
    names
      .filter(n => !n.includes('mapbox') && !n.includes('audio'))
      .map(n => caches.delete(n))
  );
}

export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 1. Listen for service worker controller change (new code deployment)
    if ('serviceWorker' in navigator) {
      const handleControllerChange = () => setShowPrompt(true);
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    }

    // 2. Check content version on every app open (catches data-only changes)
    async function checkContentVersion() {
      try {
        const res = await fetch('/api/content-version', { cache: 'no-store' });
        if (!res.ok) return;
        const { version } = await res.json();
        const stored = localStorage.getItem(VERSION_KEY);
        if (stored && stored !== version) {
          setShowPrompt(true);
        }
        // Always update stored version so we only prompt once per change
        if (!stored) {
          localStorage.setItem(VERSION_KEY, version);
        }
      } catch {
        // Offline — skip
      }
    }

    checkContentVersion();
  }, []);

  async function handleRefresh() {
    // Store the new version before reload so we don't prompt again immediately
    try {
      const res = await fetch('/api/content-version', { cache: 'no-store' });
      if (res.ok) {
        const { version } = await res.json();
        localStorage.setItem(VERSION_KEY, version);
      }
    } catch { /* ignore */ }

    await clearPageCaches();
    window.location.reload();
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-primary text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 text-sm font-medium">
        <RefreshCw className="w-4 h-4 shrink-0" />
        Tour update available — tap Refresh to see the latest.
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
