'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Volume2, ChevronRight, Loader2 } from 'lucide-react';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Footer } from '@/components/layout/Footer';
import { HistoricSitesMap } from '@/components/map/HistoricSitesMap';
import { useTenant } from '@/lib/context/tenant-context';

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

export default function TenantHistoricSitesPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;

  let orgName = '';
  try {
    const { organization } = useTenant();
    orgName = organization.name;
  } catch {
    // fallback
  }

  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSiteId, setHoveredSiteId] = useState<string | null>(null);

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

  const getImageUrl = (storagePath: string) => {
    if (storagePath.startsWith('http') || storagePath.startsWith('/')) {
      return storagePath;
    }
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tour-media/${storagePath}`;
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavigationHeader orgSlug={orgSlug} />

      <header className="bg-black text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Historic Sites</h1>
          <p className="text-gray-300">
            Explore {sites.length} historic locations
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-160px)]">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full min-h-[400px]">
              <HistoricSitesMap
                sites={sites}
                hoveredSiteId={hoveredSiteId}
                onSiteClick={(site) => {
                  window.location.href = `/t/${orgSlug}/location/${site.slug || site.id}`;
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">All Historic Sites</h2>
            <div className="space-y-3">
              {sites.map((site) => {
                const primaryImage = site.media?.find((m) => m.is_primary) || site.media?.[0];
                return (
                  <Link
                    key={site.id}
                    href={`/t/${orgSlug}/location/${site.slug || site.id}`}
                    onMouseEnter={() => setHoveredSiteId(site.id)}
                    onMouseLeave={() => setHoveredSiteId(null)}
                  >
                    <div
                      className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 overflow-hidden hover:shadow-lg hover:border-primary cursor-pointer ${
                        hoveredSiteId === site.id ? 'border-primary shadow-lg' : 'border-transparent'
                      }`}
                    >
                      <div className="flex">
                        <div className="w-32 h-32 flex-shrink-0 relative bg-gray-100">
                          {primaryImage ? (
                            <Image
                              src={getImageUrl(primaryImage.storage_path)}
                              alt={primaryImage.alt_text || site.name}
                              fill
                              className="object-cover"
                              sizes="128px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MapPin className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{site.name}</h3>
                            {site.address && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                                <MapPin className="w-3 h-3" />
                                {site.address}
                              </p>
                            )}
                            {site.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">{site.description}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              {site.audio_url && (
                                <span className="inline-flex items-center gap-1 text-xs text-primary">
                                  <Volume2 className="w-3 h-3" />
                                  Audio
                                </span>
                              )}
                            </div>
                            <span className="text-primary text-sm font-medium flex items-center">
                              View Details
                              <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
