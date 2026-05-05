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
  // Navigate to root with a cache-bust param so iOS doesn't restore the frozen page
  window.location.href = '/?_=' + Date.now();
}

const BUILD_VERSION_KEY = 'app-build-version';

export function UpdatePrompt() {
  const [countdown, setCountdown] = useState<number | null>(null);
  const reloadScheduled = useRef(false);
  const swRegRef = useRef<ServiceWorkerRegistration | null>(null);

  function scheduleReload() {
    if (reloadScheduled.current) return;
    reloadScheduled.current = true;
    setCountdown(5);
  }

  async function checkVersion() {
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

  // Countdown timer → reload when it hits 0
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { window.location.reload(); return; }
    const t = setTimeout(() => setCountdown(c => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    checkVersion();

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      checkVersion();
      // Force SW to look for a new version every time user opens the app
      swRegRef.current?.update().catch(() => {});
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Safety net: re-check every 30 seconds while app is open
    const poll = setInterval(checkVersion, 30_000);

    if ('serviceWorker' in navigator) {
      const handleControllerChange = () => {
        // Pre-store the new version so checkVersion() doesn't loop after this reload
        fetch('/api/build-version', { cache: 'no-store' })
          .then(r => r.json())
          .then(({ id }) => { if (id && id !== 'dev') localStorage.setItem(BUILD_VERSION_KEY, id); })
          .catch(() => {})
          .finally(() => scheduleReload());
      };
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      navigator.serviceWorker.getRegistration().then(reg => {
        if (!reg) return;
        swRegRef.current = reg;
        if (reg.waiting) { scheduleReload(); return; }
        reg.update().catch(() => {});
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) scheduleReload();
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
        onClick={() => window.location.reload()}
        className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1 rounded shrink-0"
      >
        Reload Now
      </button>
    </div>
  );
}
