import Image from 'next/image';
import Link from 'next/link';
import { Smartphone, Route, HelpCircle, Bookmark, MapPin } from 'lucide-react';
import QRCode from 'qrcode';
import { createClient } from '@/lib/supabase/server';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Footer } from '@/components/layout/Footer';
import { HideWhenInstalled } from '@/components/pwa/HideWhenInstalled';
import type { Tour } from '@/types';

async function getOrgAndTour(orgSlug: string) {
  const supabase = createClient();
  const { data: org } = await supabase
    .from('organizations')
    .select('id, primary_color, custom_domain, curated_tours_enabled')
    .eq('slug', orgSlug)
    .single();

  if (!org) return { org: null, tour: null };

  const { data: tour } = await supabase
    .from('tours')
    .select('*')
    .eq('organization_id', org.id)
    .order('created_at')
    .limit(1)
    .single();

  return { org, tour: tour as Tour | null };
}

export default async function TenantHomePage({
  params,
}: {
  params: { orgSlug: string };
}) {
  const { org, tour } = await getOrgAndTour(params.orgSlug);
  const primaryColor = org?.primary_color || '#0B6E69';
  const curatedToursEnabled = org?.curated_tours_enabled ?? true;

  const baseUrl = org?.custom_domain
    ? `https://${org.custom_domain}`
    : `https://walkingtourbuilder.com/t/${params.orgSlug}`;
  let qrSvg = '';
  try {
    qrSvg = await QRCode.toString(baseUrl, {
      type: 'svg',
      width: 200,
      margin: 2,
      color: { dark: primaryColor, light: '#ffffff' },
    });
  } catch {
    // QR generation failed
  }

  const cardClass =
    'flex items-center gap-2.5 px-4 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg shadow transition-colors';

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="absolute top-0 left-0 right-0 z-50">
        <NavigationHeader transparent orgSlug={params.orgSlug} />
      </div>

      <header className="relative flex-1 min-h-[80vh] flex items-center justify-center">
        {tour?.cover_image_url ? (
          <Image
            src={tour.cover_image_url}
            alt={tour.name || 'Walking Tour'}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
        )}

        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {tour?.name || 'Welcome to the Walking Tour'}
          </h1>
          {tour?.description && (
            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              {tour.description}
            </p>
          )}

          {curatedToursEnabled ? (
            /* 4 cards: 2×2 grid */
            <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto w-full mt-2">
              <Link href={`/t/${params.orgSlug}/how-to-use`} className={cardClass}>
                <HelpCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-semibold leading-tight">How to Use</span>
              </Link>
              <Link href={`/t/${params.orgSlug}/historic-sites`} className={cardClass}>
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-semibold leading-tight">Historic Sites</span>
              </Link>
              <Link href={`/t/${params.orgSlug}/create-your-tour`} className={cardClass}>
                <Route className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-semibold leading-tight">Create Your Tour</span>
              </Link>
              <Link href={`/t/${params.orgSlug}/curated-tours`} className={cardClass}>
                <Bookmark className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-semibold leading-tight">Curated Tours</span>
              </Link>
            </div>
          ) : (
            /* 3 cards: centered flex row */
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              <Link href={`/t/${params.orgSlug}/how-to-use`} className={cardClass}>
                <HelpCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-semibold leading-tight">How to Use</span>
              </Link>
              <Link href={`/t/${params.orgSlug}/historic-sites`} className={cardClass}>
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-semibold leading-tight">Historic Sites</span>
              </Link>
              <Link href={`/t/${params.orgSlug}/create-your-tour`} className={cardClass}>
                <Route className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-semibold leading-tight">Create Your Tour</span>
              </Link>
            </div>
          )}
        </div>
      </header>

      <HideWhenInstalled>
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 text-center">
            <Smartphone className="w-10 h-10 mx-auto mb-4" style={{ color: primaryColor }} />
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
              Get the App on Your Phone
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Scan the QR code with your phone camera to open the tour. Then tap &ldquo;Add to Home Screen&rdquo; to install it as an app.
            </p>

            {qrSvg && (
              <div className="hidden md:flex flex-col items-center gap-4">
                <div
                  className="inline-block p-4 bg-white rounded-xl shadow-lg border"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                <p className="text-sm text-gray-500">Scan with your phone camera</p>
              </div>
            )}

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
