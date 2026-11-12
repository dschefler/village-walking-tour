'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Volume2, ChevronRight, Loader2, Plus, Check, Route, X } from 'lucide-react';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Footer } from '@/components/layout/Footer';
import { HistoricSitesMap } from '@/components/map/HistoricSitesMap';
import { useTourBuilderStore } from '@/stores/tour-builder-store';
import { useTenantOptional } from '@/lib/context/tenant-context';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getStorageMediaUrl, siteAddressLabel } from '@/lib/utils';
import { AreaBadge } from '@/components/location/AreaBadge';
import { CategoryBadge } from '@/components/location/CategoryBadge';
import { SITE_CATEGORIES, normalizeCategory, type SiteCategory } from '@/lib/site-categories';

interface SiteItem {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  address: string | null;
  address_formatted?: string | null;
  is_area?: boolean;
  area_radius_m?: number;
  start_point?: string | null;
  category?: string | null;
  latitude: number;
  longitude: number;
  audio_url: string | null;
  media?: {
    id: string;
    storage_path: string;
    alt_text: string | null;
    is_primary: boolean;
  }[];
}

export default function TenantHistoricSitesPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const router = useRouter();

  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSiteId, setHoveredSiteId] = useState<string | null>(null);
  const [popupSite, setPopupSite] = useState<SiteItem | null>(null);
  const [audioDialogSite, setAudioDialogSite] = useState<SiteItem | null>(null);
  // Categories the visitor has narrowed to (?category=a,b in the URL, so the
  // menu and Start Your Tour page can link straight to one); empty = everything
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') ?? '';
  const activeCategories = useMemo(
    () => new Set(categoryParam.split(',').map((k) => normalizeCategory(k)).filter((k): k is SiteCategory => k !== null)),
    [categoryParam]
  );
  const setActiveCategories = (next: Set<SiteCategory>) => {
    const query = next.size ? `?category=${Array.from(next).join(',')}` : '';
    router.replace(`/t/${orgSlug}/historic-sites${query}`, { scroll: false });
  };
  const { pendingIds, toggle, clear } = useTourBuilderStore();
  const tenant = useTenantOptional();
  const orgName = tenant?.organization.app_name || tenant?.organization.name || 'this area';

  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch(`/api/locations?orgSlug=${orgSlug}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setSites(data);
      } catch (error) {
        console.error('Error fetching sites:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSites();
  }, [orgSlug]);

  const selectedIds = new Set(pendingIds);

  // Only offer chips for categories this tour actually uses
  const usedCategories = SITE_CATEGORIES.filter((c) => sites.some((s) => normalizeCategory(s.category) === c.key));
  const visibleSites = activeCategories.size === 0
    ? sites
    : sites.filter((s) => { const c = normalizeCategory(s.category); return c !== null && activeCategories.has(c); });

  const toggleCategory = (key: SiteCategory) => {
    const next = new Set(activeCategories);
    if (next.has(key)) next.delete(key); else next.add(key);
    setActiveCategories(next);
    setPopupSite(null);
  };

  // Tours that tag stops by category aren't all-historic, so drop that word
  const byCategory = usedCategories.length > 0;
  const singleCategory = activeCategories.size === 1 ? SITE_CATEGORIES.find((c) => activeCategories.has(c.key)) : undefined;
  const pageTitle = !byCategory ? 'Historic Sites' : singleCategory ? singleCategory.label : 'All Sites';

  const getImageUrl = getStorageMediaUrl;

  const handleMapClick = (site: { id: string; name: string; slug: string | null; latitude: number; longitude: number }) => {
    const full = sites.find(s => s.id === site.id) ?? null;
    if (full) { setPopupSite(full); setHoveredSiteId(site.id); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <NavigationHeader transparent orgSlug={orgSlug} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
      <NavigationHeader orgSlug={orgSlug} />

      <header className="bg-black text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{pageTitle}</h1>
          <p className="text-gray-300">
            Explore {visibleSites.length}{byCategory ? '' : ' historic'} location{visibleSites.length !== 1 ? 's' : ''} in {orgName}
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {pendingIds.length > 0 && (
          <div className="mb-4 flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-primary">{pendingIds.length} site{pendingIds.length !== 1 ? 's' : ''} selected for your tour</span>
            <button onClick={clear} className="text-xs text-gray-500 hover:text-gray-700 underline">Clear</button>
            <button
              onClick={() => router.push(`/t/${orgSlug}/create-your-tour`)}
              className="ml-auto flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors"
            >
              <Route className="w-4 h-4" />
              Build Tour
            </button>
          </div>
        )}

        {usedCategories.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
            <button
              onClick={() => { setActiveCategories(new Set()); setPopupSite(null); }}
              aria-pressed={activeCategories.size === 0}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                activeCategories.size === 0 ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            {usedCategories.map(({ key, label, color, icon: Icon }) => {
              const active = activeCategories.has(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleCategory(key)}
                  aria-pressed={active}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-colors"
                  style={active ? { backgroundColor: color, borderColor: color, color: '#fff' } : { backgroundColor: '#fff', borderColor: color, color }}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 min-w-0">
          {/* Map Section */}
          <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-160px)] min-w-0 w-full">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full min-h-[400px] relative w-full">
              <HistoricSitesMap
                sites={visibleSites}
                hoveredSiteId={hoveredSiteId}
                selectedIds={selectedIds}
                onSiteClick={handleMapClick}
              />

              {/* Site popup card */}
              {popupSite && (
                <div className="absolute bottom-0 left-0 right-0 bg-white shadow-2xl rounded-t-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
                  <div className="flex items-start gap-3 p-4">
                    {(() => {
                      const img = popupSite.media?.find(m => m.is_primary) ?? popupSite.media?.[0];
                      return img ? (
                        <div className="w-16 h-16 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100">
                          <Image src={getImageUrl(img.storage_path)} alt={popupSite.name} fill className="object-cover" sizes="64px" />
                        </div>
                      ) : null;
                    })()}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 leading-snug">{popupSite.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1 empty:hidden">
                        <CategoryBadge category={popupSite.category} />
                        {popupSite.is_area && <AreaBadge />}
                      </div>
                      {siteAddressLabel(popupSite, true) && <p className="text-xs text-gray-500 mt-0.5">{siteAddressLabel(popupSite, true)}</p>}
                      {popupSite.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{popupSite.description}</p>}
                    </div>
                    <button onClick={() => { setPopupSite(null); setHoveredSiteId(null); }} className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2 px-4 pb-4">
                    <button
                      onClick={() => toggle(popupSite.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        selectedIds.has(popupSite.id)
                          ? 'bg-primary text-white'
                          : 'border-2 border-primary text-primary hover:bg-primary/10'
                      }`}
                    >
                      {selectedIds.has(popupSite.id) ? <><Check className="w-4 h-4" /> Added to Tour</> : <><Plus className="w-4 h-4" /> Add to Tour</>}
                    </button>
                    <Link
                      href={`/t/${orgSlug}/location/${popupSite.slug || popupSite.id}`}
                      className="flex items-center justify-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Details
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sites Listing */}
          <div className="space-y-4 min-w-0 w-full">
            <h2 className="text-xl font-semibold text-gray-900">{byCategory ? pageTitle : 'All Historic Sites'}</h2>
            <div className="space-y-3">
              {visibleSites.map((site) => {
                const primaryImage = site.media?.find((m) => m.is_primary) || site.media?.[0];
                const isSelected = selectedIds.has(site.id);

                return (
                  <div
                    key={site.id}
                    className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 overflow-hidden ${
                      isSelected ? 'border-primary' : hoveredSiteId === site.id ? 'border-primary shadow-lg' : 'border-transparent'
                    }`}
                    onMouseEnter={() => setHoveredSiteId(site.id)}
                    onMouseLeave={() => setHoveredSiteId(null)}
                  >
                    <div className="flex">
                      <div className="w-24 h-24 flex-shrink-0 relative bg-gray-100">
                        {primaryImage ? (
                          <Image src={getImageUrl(primaryImage.storage_path)} alt={primaryImage.alt_text || site.name} fill className="object-cover" sizes="96px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{site.name}</h3>
                          <div className="flex flex-wrap gap-1 mt-1 empty:hidden">
                            <CategoryBadge category={site.category} />
                            {site.is_area && <AreaBadge />}
                          </div>
                          {siteAddressLabel(site, true) && (
                            <p className="text-xs text-[#014487] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{siteAddressLabel(site, true)}</span>
                            </p>
                          )}
                          {site.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">{site.description}</p>
                          )}
                        </div>
                        <div className="mt-2 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggle(site.id)}
                              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                                isSelected
                                  ? 'bg-primary text-white'
                                  : 'border border-primary text-primary hover:bg-primary/10'
                              }`}
                            >
                              {isSelected ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add to Tour</>}
                            </button>
                            {site.audio_url && (
                              <button
                                onClick={() => setAudioDialogSite(site)}
                                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                              >
                                <Volume2 className="w-3 h-3" />
                                Audio
                              </button>
                            )}
                          </div>
                          <Link
                            href={`/t/${orgSlug}/location/${site.slug || site.id}`}
                            className="flex items-center gap-0.5 text-xs font-semibold text-primary hover:underline"
                          >
                            Read More <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Build Tour button (mobile) */}
      {pendingIds.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
          <button
            onClick={() => router.push(`/t/${orgSlug}/create-your-tour`)}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white text-sm font-bold py-3.5 rounded-xl shadow-xl hover:bg-primary/80 transition-colors"
          >
            <Route className="w-5 h-5" />
            Build Tour with {pendingIds.length} Site{pendingIds.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      <Footer />

      {/* Audio dialog */}
      <Dialog open={!!audioDialogSite} onOpenChange={(open) => { if (!open) setAudioDialogSite(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              {audioDialogSite?.name}
            </DialogTitle>
          </DialogHeader>
          {audioDialogSite?.audio_url && (
            <AudioPlayer
              audioUrl={audioDialogSite.audio_url}
              siteId={audioDialogSite.id}
              siteName={audioDialogSite.name}
              autoPlay
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
