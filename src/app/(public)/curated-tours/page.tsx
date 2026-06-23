import type { Metadata } from 'next';
import Link from 'next/link';
import { Bookmark, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Footer } from '@/components/layout/Footer';
import { CURATED_TOURS } from '@/lib/curated-tours';

export const metadata: Metadata = {
  title: 'Curated Tours',
  description:
    'Browse curated self-guided walking tours of Southampton Village — themed routes through the historic district with audio narration, photos, and fun facts.',
  alternates: { canonical: 'https://southamptonwalkingtour.com/curated-tours' },
};

export default function PublicCuratedToursPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationHeader />
      <Breadcrumb items={[{ label: 'Curated Theme Tours' }]} />

      <header className="bg-gradient-to-br from-[#035297] to-[#024480] text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Bookmark className="w-8 h-8" />
            Curated Tours
          </h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Explore Southampton Village through themed tours curated around specific chapters of
            local history. Locations are pre-selected — customize your route before you go.
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
              <p className="text-sm text-[#035297] font-medium mb-3">{tour.tagline}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {tour.description}
              </p>

              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-[#035297]" />
                  <span>
                    {tour.locations.length} suggested location{tour.locations.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <Button asChild className="bg-[#035297] hover:bg-[#024480] text-white gap-2">
                  <Link href={`/t/southampton/curated-tours/${tour.slug}`}>
                    Start This Tour
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="px-6 pb-5 flex flex-wrap gap-2">
              {tour.locations.map((loc) => (
                <span
                  key={loc}
                  className="inline-block bg-[#035297]/8 text-[#035297] text-xs font-medium px-2.5 py-1 rounded-full border border-[#035297]/20"
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
