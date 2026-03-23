'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clearPageCaches } from './UpdatePrompt';

// Checks Supabase content version on every app open.
// Shows a banner when tour/site data has changed since last visit.
// Used by both the Southampton public app and every tenant (walkingtourbuilder clients).
export function ContentVersionChecker({ orgSlug }: { orgSlug: string }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const storageKey = `wt-content-version-${orgSlug}`;

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch(`/api/content-version?org=${orgSlug}`, { cache: 'no-store' });
        if (!res.ok) return;
        const { version } = await res.json();
        const stored = localStorage.getItem(storageKey);
        setLatestVersion(version);
        if (stored && stored !== version) {
          setShowPrompt(true);
        } else if (!stored) {
          // First visit — store silently, no prompt needed
          localStorage.setItem(storageKey, version);
        }
      } catch {
        // Offline — skip
      }
    }
    check();
  }, [orgSlug, storageKey]);

  async function handleRefresh() {
    if (latestVersion) localStorage.setItem(storageKey, latestVersion);
    await clearPageCaches();
    window.location.reload();
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99] bg-primary text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 text-sm font-medium">
        <RefreshCw className="w-4 h-4 shrink-0" />
        Tour updates available — tap Refresh to see the latest stops.
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
