import Image from 'next/image';
import Link from 'next/link';
import { Route, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';
import { createClient } from '@/lib/supabase/server';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Footer } from '@/components/layout/Footer';
import { StartExploringButton } from '@/components/layout/StartExploringButton';
import { HideWhenInstalled } from '@/components/pwa/HideWhenInstalled';
import { Button } from '@/components/ui/button';
import type { Tour } from '@/types';

async function getPublishedTour(): Promise<Tour | null> {
  const supabase = createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', 'southampton')
    .single();

  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('is_published', true)
    .eq('organization_id', org?.id)
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

  // Generate QR code for desktop visitors
  const siteUrl = 'https://southamptonwalkingtour.com';
  let qrSvg = '';
  try {
    qrSvg = await QRCode.toString(siteUrl, {
      type: 'svg',
      width: 200,
      margin: 2,
      color: { dark: '#A40000', light: '#ffffff' },
    });
  } catch (e) {
    // QR generation failed, section will be hidden
  }

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
              className="bg-primary text-primary-foreground hover:bg-primary/80 gap-2"
            >
              <Link href="/create-your-tour">
                <Route className="w-5 h-5" />
                Create Your Tour
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Get the App section — hidden when running as installed PWA */}
      <HideWhenInstalled>
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 text-center">
            <Smartphone className="w-10 h-10 mx-auto mb-4 text-[#A40000]" />
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
              Get the App on Your Phone
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Scan the QR code with your phone camera to open the tour. Then tap &ldquo;Add to Home Screen&rdquo; to install it as an app.
            </p>

            {/* QR code — visible on desktop, hidden on mobile */}
            {qrSvg && (
              <div className="hidden md:flex flex-col items-center gap-4">
                <div
                  className="inline-block p-4 bg-white rounded-xl shadow-lg border"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                <p className="text-sm text-gray-500">
                  Scan with your phone camera
                </p>
              </div>
            )}

            {/* Mobile — show direct install hint */}
            <div className="md:hidden">
              <p className="text-sm text-gray-500">
                On iPhone: tap the Share button, then &ldquo;Add to Home Screen.&rdquo;
                <br />
                On Android: tap the menu, then &ldquo;Install app.&rdquo;
              </p>
            </div>
          </div>
        </section>
      </HideWhenInstalled>

      <Footer />
    </div>
  );
}
