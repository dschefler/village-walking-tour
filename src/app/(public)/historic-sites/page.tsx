'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, Volume2, ChevronRight, Loader2, Plus, Check, Route, X } from 'lucide-react';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Footer } from '@/components/layout/Footer';
import { HistoricSitesMap } from '@/components/map/HistoricSitesMap';
import { useTourBuilderStore } from '@/stores/tour-builder-store';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SiteItem {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  address: string | null;
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

export default function HistoricSitesPage() {
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSiteId, setHoveredSiteId] = useState<string | null>(null);
  const [popupSite, setPopupSite] = useState<SiteItem | null>(null);
  const { pendingIds, toggle, clear } = useTourBuilderStore();
  const router = useRouter();
  const [audioDialogSite, setAudioDialogSite] = useState<SiteItem | null>(null);

  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/locations?orgSlug=southampton');
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
  }, []);

  const selectedIds = new Set(pendingIds);

  const getImageUrl = (storagePath: string) => {
    if (storagePath.startsWith('http') || storagePath.startsWith('/')) return storagePath;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tour-media/${storagePath}`;
  };

  const handleMapClick = (site: { id: string; name: string; slug: string | null; latitude: number; longitude: number }) => {
    const full = sites.find(s => s.id === site.id) ?? null;
    if (full) { setPopupSite(full); setHoveredSiteId(site.id); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#035297]">
        <NavigationHeader transparent />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
      <NavigationHeader />
      <Breadcrumb items={[{ label: 'Historic Sites' }]} />

      {/* Hero */}
      <header className="bg-gradient-to-br from-[#035297] to-[#024480] text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Historic Sites</h1>
          <p className="text-gray-300">
            Explore {sites.length} historic locations in Southampton Village
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {pendingIds.length > 0 && (
          <div className="mb-4 flex items-center gap-3 bg-[#035297]/10 border border-[#035297]/30 rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-[#035297]">{pendingIds.length} site{pendingIds.length !== 1 ? 's' : ''} selected for your tour</span>
            <button onClick={clear} className="text-xs text-gray-500 hover:text-gray-700 underline">Clear</button>
            <button
              onClick={() => router.push('/create-your-tour')}
              className="ml-auto flex items-center gap-1.5 bg-[#035297] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#024480] transition-colors"
            >
              <Route className="w-4 h-4" />
              Build Tour
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 min-w-0">
          {/* Map Section */}
          <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-160px)] min-w-0 w-full">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full min-h-[400px] relative w-full">
              <HistoricSitesMap
                sites={sites}
                hoveredSiteId={hoveredSiteId}
                selectedIds={selectedIds}
                onSiteClick={handleMapClick}
              />

              {/* Site popup card */}
              {popupSite && (
                <div className="absolute bottom-0 left-0 right-0 bg-white shadow-2xl rounded-t-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
                  <div className="flex items-start gap-3 p-4">
                    {/* Image */}
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
                      {popupSite.address && <p className="text-xs text-gray-500 mt-0.5">{popupSite.address}</p>}
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
                          ? 'bg-[#035297] text-white'
                          : 'border-2 border-[#035297] text-[#035297] hover:bg-[#035297]/10'
                      }`}
                    >
                      {selectedIds.has(popupSite.id) ? <><Check className="w-4 h-4" /> Added to Tour</> : <><Plus className="w-4 h-4" /> Add to Tour</>}
                    </button>
                    <Link
                      href={`/location/${popupSite.slug || popupSite.id}`}
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
            <h2 className="text-xl font-semibold text-gray-900">All Historic Sites</h2>
            <div className="space-y-3">
              {sites.map((site) => {
                const primaryImage = site.media?.find((m) => m.is_primary) || site.media?.[0];
                const isSelected = selectedIds.has(site.id);

                return (
                  <div
                    key={site.id}
                    className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 overflow-hidden ${
                      isSelected ? 'border-[#035297]' : hoveredSiteId === site.id ? 'border-[#035297] shadow-lg' : 'border-transparent'
                    }`}
                    onMouseEnter={() => setHoveredSiteId(site.id)}
                    onMouseLeave={() => setHoveredSiteId(null)}
                  >
                    <div className="flex">
                      {/* Image */}
                      <div className="w-24 h-24 flex-shrink-0 relative bg-gray-100">
                        {primaryImage ? (
                          <Image src={getImageUrl(primaryImage.storage_path)} alt={primaryImage.alt_text || site.name} fill className="object-cover" sizes="96px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{site.name}</h3>
                          {site.address && (
                            <p className="text-xs text-[#014487] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{site.address}</span>
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
                                  ? 'bg-[#035297] text-white'
                                  : 'border border-[#035297] text-[#035297] hover:bg-[#035297]/10'
                              }`}
                            >
                              {isSelected ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add to Tour</>}
                            </button>
                            {site.audio_url && (
                              <button
                                onClick={() => setAudioDialogSite(site)}
                                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border border-[#014487] text-[#014487] hover:bg-[#014487]/10 transition-colors"
                              >
                                <Volume2 className="w-3 h-3" />
                                Audio
                              </button>
                            )}
                          </div>
                          <Link
                            href={`/location/${site.slug || site.id}`}
                            className="flex items-center gap-0.5 text-xs font-semibold text-[#035297] hover:underline"
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
            onClick={() => router.push('/create-your-tour')}
            className="w-full flex items-center justify-center gap-2 bg-[#035297] text-white text-sm font-bold py-3.5 rounded-xl shadow-xl hover:bg-[#024480] transition-colors"
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
