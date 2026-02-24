import Image from 'next/image';
import Link from 'next/link';
import { Route } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Footer } from '@/components/layout/Footer';
import { StartExploringButton } from '@/components/layout/StartExploringButton';
import { Button } from '@/components/ui/button';
import type { Tour } from '@/types';

async function getPublishedTour(): Promise<Tour | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('is_published', true)
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching tour:', error);
    return null;
  }

  return data;
}

export default async function HomePage() {
  const tour = await getPublishedTour();

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Navigation - transparent over image */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <NavigationHeader transparent />
      </div>

      {/* Hero Section with Background Image */}
      <header className="relative flex-1 min-h-[80vh] flex items-center justify-center">
        {/* Background Image */}
        {tour?.cover_image_url ? (
          <Image
            src={tour.cover_image_url}
            alt={tour.name || 'Village Walking Tour'}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
        )}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Welcome to the Southampton Village Walking Tour
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Discover the rich history and hidden stories of our village through
            this self-guided walking tour. Explore at your own pace with GPS navigation
            and audio narration.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <StartExploringButton />
            <Button
              size="lg"
              asChild
              className="bg-[#A40000] text-white hover:bg-black hover:text-white gap-2"
            >
              <Link href="/create-your-tour">
                <Route className="w-5 h-5" />
                Create Your Tour
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <Footer />
    </div>
  );
}
