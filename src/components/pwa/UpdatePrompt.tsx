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

const BUILD_VERSION_KEY = 'app-build-version';

export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // --- Layer 1: build-version check (iOS-reliable, SW-independent) ---
    // Fetches the current deployment ID from the server on every app open.
    // If it differs from what we stored, the user has old code → show banner.
    async function checkBuildVersion() {
      try {
        const res = await fetch('/api/build-version', { cache: 'no-store' });
        if (!res.ok) return;
        const { id } = await res.json();
        if (id === 'dev') return; // skip in local dev
        const stored = localStorage.getItem(BUILD_VERSION_KEY);
        if (!stored) {
          // First visit — store silently
          localStorage.setItem(BUILD_VERSION_KEY, id);
        } else if (stored !== id) {
          // New deployment detected
          setShowPrompt(true);
        }
      } catch {
        // Offline — skip
      }
    }

    checkBuildVersion();

    // --- Layer 2: service worker controllerchange (works when SW update fires) ---
    if (!('serviceWorker' in navigator)) return;

    const handleControllerChange = () => setShowPrompt(true);
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    async function checkSWUpdate() {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) return;

      if (reg.waiting) {
        setShowPrompt(true);
        return;
      }

      reg.update().catch(() => {});

      reg.addEventListener('updatefound', () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            setShowPrompt(true);
          }
        });
      });
    }

    checkSWUpdate();

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  async function handleRefresh() {
    // Store the new build version so the banner doesn't re-appear immediately
    try {
      const res = await fetch('/api/build-version', { cache: 'no-store' });
      if (res.ok) {
        const { id } = await res.json();
        localStorage.setItem(BUILD_VERSION_KEY, id);
      }
    } catch { /* offline */ }
    await unregisterAndReload();
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-primary text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 text-sm font-medium">
        <RefreshCw className="w-4 h-4 shrink-0" />
        App updated — tap Refresh to load the latest version.
      </div>
      <Button size="sm" variant="secondary" onClick={handleRefresh} className="h-7 text-xs font-semibold shrink-0">
        Refresh
      </Button>
    </div>
  );
}
