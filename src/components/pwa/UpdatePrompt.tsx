'use client';

import { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

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

// Returns the current build ID — two sources, either one changing triggers an update:
// 1. API call: works even in old cached JS since it hits the server (detects new Vercel deploys)
// 2. Baked-in env var: instant fallback for when the API is slow/unavailable
const BAKED_BUILD_ID: string | null =
  process.env.NEXT_PUBLIC_APP_BUILD_ID && process.env.NEXT_PUBLIC_APP_BUILD_ID !== 'dev'
    ? process.env.NEXT_PUBLIC_APP_BUILD_ID
    : null;

export function UpdatePrompt() {
  const [countdown, setCountdown] = useState<number | null>(null);
  const reloadScheduled = useRef(false);
  const swRegRef = useRef<ServiceWorkerRegistration | null>(null);

  function scheduleReload() {
    if (reloadScheduled.current) return;
    reloadScheduled.current = true;
    setCountdown(5);
  }

  function checkBakedVersion() {
    if (!BAKED_BUILD_ID) return;
    const stored = localStorage.getItem(BUILD_VERSION_KEY);
    if (!stored) {
      localStorage.setItem(BUILD_VERSION_KEY, BAKED_BUILD_ID);
      return;
    }
    if (stored !== BAKED_BUILD_ID) {
      localStorage.setItem(BUILD_VERSION_KEY, BAKED_BUILD_ID);
      scheduleReload();
    }
  }

  async function checkApiVersion() {
    try {
      const res = await fetch('/api/build-version', { cache: 'no-store' });
      if (!res.ok) return;
      const { id } = await res.json();
      if (!id || id === 'dev') return;
      const stored = localStorage.getItem(BUILD_VERSION_KEY);
      if (!stored) {
        localStorage.setItem(BUILD_VERSION_KEY, id);
        return;
      }
      if (stored !== id) {
        localStorage.setItem(BUILD_VERSION_KEY, id);
        scheduleReload();
      }
    } catch {
      // Offline — skip
    }
  }

  // Countdown timer
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      unregisterAndReload();
      return;
    }
    const t = setTimeout(() => setCountdown(c => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    // Check baked version immediately (synchronous, instant)
    checkBakedVersion();
    // Check API version (detects new deploys even in old cached JS)
    checkApiVersion();

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      checkBakedVersion();
      checkApiVersion();
      // Force SW to check for updates whenever user returns to the app
      swRegRef.current?.update().catch(() => {});
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Poll every 30 seconds
    const poll = setInterval(() => {
      checkBakedVersion();
      checkApiVersion();
    }, 30_000);

    // Service worker paths
    if ('serviceWorker' in navigator) {
      const handleControllerChange = () => scheduleReload();
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      navigator.serviceWorker.getRegistration().then(reg => {
        if (!reg) return;
        swRegRef.current = reg;
        if (reg.waiting) { scheduleReload(); return; }
        reg.update().catch(() => {});
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              scheduleReload();
            }
          });
        });
      });

      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
        document.removeEventListener('visibilitychange', handleVisibility);
        clearInterval(poll);
      };
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(poll);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (countdown === null) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-primary text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 text-sm font-medium">
        <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
        App updated — reloading in {countdown}s
      </div>
      <button
        onClick={() => unregisterAndReload()}
        className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1 rounded shrink-0"
      >
        Reload Now
      </button>
    </div>
  );
}
