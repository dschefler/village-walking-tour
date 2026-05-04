'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
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

export async function unregisterAndReload() {
  await clearPageCaches();
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map(r => r.unregister()));
  }
  window.location.reload();
}

export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Show banner when a new SW takes control (handles mid-session activations)
    const handleControllerChange = () => setShowPrompt(true);
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    async function checkForUpdates() {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) return;

      // Already a waiting SW (skipWaiting didn't fire for some reason) — show now
      if (reg.waiting) {
        setShowPrompt(true);
        return;
      }

      // Trigger an update check
      reg.update().catch(() => {});

      // Also catch the case where a new SW starts installing after this page loaded
      reg.addEventListener('updatefound', () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          // 'installed' = new SW ready; with skipWaiting it immediately activates,
          // but we show the banner here so it's visible as fast as possible
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            setShowPrompt(true);
          }
        });
      });
    }

    checkForUpdates();

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-primary text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 text-sm font-medium">
        <RefreshCw className="w-4 h-4 shrink-0" />
        App updated — tap Refresh to load the latest version.
      </div>
      <Button size="sm" variant="secondary" onClick={unregisterAndReload} className="h-7 text-xs font-semibold shrink-0">
        Refresh
      </Button>
    </div>
  );
}
