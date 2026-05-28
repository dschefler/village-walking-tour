import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Bookmark, MapPin, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Footer } from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase/server';
import type { OrgCuratedTour } from '@/types';

async function getCuratedTours(orgSlug: string) {
  const supabase = createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('id, curated_tours_enabled')
    .eq('slug', orgSlug)
    .single();

  if (!org) return null;
  if (!org.curated_tours_enabled) return [];

  const { data } = await supabase
    .from('org_curated_tours')
    .select('*')
    .eq('organization_id', org.id)
    .order('display_order', { ascending: true });

  return (data ?? []) as OrgCuratedTour[];
}

export default async function CuratedToursListPage({
  params,
}: {
  params: { orgSlug: string };
}) {
  const tours = await getCuratedTours(params.orgSlug);

  if (tours === null) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <NavigationHeader orgSlug={params.orgSlug} />

      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Bookmark className="w-8 h-8" />
            Curated Tours
          </h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Explore themed tours curated around specific topics, eras, or aspects of local history and culture.
            Locations are pre-selected — customize your route before you go.
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl space-y-6">
        {tours.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No curated tours yet</p>
            <p className="text-sm mt-1">Check back soon — themed tours are coming.</p>
          </div>
        ) : (
          tours.map((tour) => (
            <div
              key={tour.slug}
              className="bg-white rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-1">{tour.name}</h2>
                {tour.tagline && (
                  <p className="text-sm text-primary font-medium mb-3">{tour.tagline}</p>
                )}
                {tour.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {tour.description}
                  </p>
                )}

                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>
                        {tour.site_names.length} suggested location{tour.site_names.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {tour.time_estimate && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{tour.time_estimate}</span>
                      </div>
                    )}
                  </div>
                  <Button asChild className="bg-primary hover:bg-primary/80 text-primary-foreground gap-2">
                    <Link href={`/t/${params.orgSlug}/curated-tours/${tour.slug}`}>
                      Start This Tour
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {tour.site_names.length > 0 && (
                <div className="px-6 pb-5 flex flex-wrap gap-2">
                  {tour.site_names.map((loc) => (
                    <span
                      key={loc}
                      className="inline-block bg-primary/8 text-primary text-xs font-medium px-2.5 py-1 rounded-full border border-primary/20"
                    >
                      {loc}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </main>

      <Footer />
    </div>
  );
}
