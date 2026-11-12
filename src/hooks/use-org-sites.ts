'use client';

import { useEffect, useState } from 'react';
import { SITE_CATEGORIES, siteCategoryKeys } from '@/lib/site-categories';

export interface OrgSiteItem {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
  category?: string | null;
  categories?: string[] | null;
}

// One request per org per page load, shared by the desktop dropdown and the mobile menu
const cache = new Map<string, Promise<OrgSiteItem[]>>();

function loadSites(orgSlug?: string): Promise<OrgSiteItem[]> {
  const key = orgSlug ?? '';
  let p = cache.get(key);
  if (!p) {
    p = fetch(orgSlug ? `/api/locations?orgSlug=${orgSlug}` : '/api/locations')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to fetch'))))
      .catch((err) => {
        cache.delete(key);
        throw err;
      });
    cache.set(key, p);
  }
  return p;
}

/** Published sites for an org plus the categories they use that belong in the menu (SITE_CATEGORIES order) */
export function useOrgSites(orgSlug?: string) {
  const [sites, setSites] = useState<OrgSiteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadSites(orgSlug)
      .then((data) => { if (!cancelled) setSites(data); })
      .catch((error) => console.error('Error fetching locations:', error))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [orgSlug]);

  // Only tenant tours use categories; the un-prefixed Southampton site never does
  const categories = !orgSlug ? [] : SITE_CATEGORIES.filter((c) => c.inMenu !== false && sites.some((s) => siteCategoryKeys(s).includes(c.key)));
  return { sites, categories, loading };
}
