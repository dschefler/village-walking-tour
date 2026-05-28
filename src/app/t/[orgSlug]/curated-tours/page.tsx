import Link from 'next/link';
import { Bookmark, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Footer } from '@/components/layout/Footer';
import { CURATED_TOURS } from '@/lib/curated-tours';

export default function CuratedToursListPage({
  params,
}: {
  params: { orgSlug: string };
}) {
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
        {CURATED_TOURS.map((tour) => (
          <div
            key={tour.slug}
            className="bg-white rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-1">{tour.name}</h2>
              <p className="text-sm text-primary font-medium mb-3">{tour.tagline}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {tour.description}
              </p>

              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>
                    {tour.locations.length} suggested location{tour.locations.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <Button asChild className="bg-primary hover:bg-primary/80 text-primary-foreground gap-2">
                  <Link href={`/t/${params.orgSlug}/curated-tours/${tour.slug}`}>
                    Start This Tour
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Location pill list */}
            <div className="px-6 pb-5 flex flex-wrap gap-2">
              {tour.locations.map((loc) => (
                <span
                  key={loc}
                  className="inline-block bg-primary/8 text-primary text-xs font-medium px-2.5 py-1 rounded-full border border-primary/20"
                >
                  {loc}
                </span>
              ))}
            </div>
          </div>
        ))}
      </main>

      <Footer />
    </div>
  );
}
