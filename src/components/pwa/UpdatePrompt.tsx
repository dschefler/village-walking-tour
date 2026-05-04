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

// Baked into the JS bundle at build time — changes on every Vercel deploy.
const CURRENT_BUILD_ID = process.env.NEXT_PUBLIC_APP_BUILD_ID ?? 'dev';
const BUILD_VERSION_KEY = 'app-build-version';

export function UpdatePrompt() {
  const [countdown, setCountdown] = useState<number | null>(null);
  const reloadScheduled = useRef(false);

  function checkBuildVersion() {
    if (CURRENT_BUILD_ID === 'dev') return;
    const stored = localStorage.getItem(BUILD_VERSION_KEY);
    if (!stored) {
      localStorage.setItem(BUILD_VERSION_KEY, CURRENT_BUILD_ID);
      return;
    }
    if (stored !== CURRENT_BUILD_ID && !reloadScheduled.current) {
      reloadScheduled.current = true;
      localStorage.setItem(BUILD_VERSION_KEY, CURRENT_BUILD_ID);
      setCountdown(5);
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
    checkBuildVersion();

    // Re-check when user switches back to the app
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkBuildVersion();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Also poll every 30 seconds so stale sessions eventually self-update
    const poll = setInterval(checkBuildVersion, 30_000);

    // Service worker controller-change path (SW update takes over)
    if ('serviceWorker' in navigator) {
      const handleControllerChange = () => {
        if (!reloadScheduled.current) {
          reloadScheduled.current = true;
          setCountdown(5);
        }
      };
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      navigator.serviceWorker.getRegistration().then(reg => {
        if (!reg) return;
        if (reg.waiting && !reloadScheduled.current) {
          reloadScheduled.current = true;
          setCountdown(5);
          return;
        }
        reg.update().catch(() => {});
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller && !reloadScheduled.current) {
              reloadScheduled.current = true;
              setCountdown(5);
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
