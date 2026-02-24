import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Route } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Footer } from '@/components/layout/Footer';
import { LocationHero } from '@/components/location/LocationHero';
import { LocationMap } from '@/components/location/LocationMap';
import { DirectionsButton } from '@/components/location/DirectionsButton';
import { WalkingTimeEstimate } from '@/components/location/WalkingTimeEstimate';
import { NearbyLocations } from '@/components/location/NearbyLocations';
import { ImageGallery } from '@/components/gallery/ImageGallery';
import { ListenToAudioButton } from '@/components/audio/ListenToAudioButton';
import { LocationArrivalTracker } from '@/components/location/LocationArrivalTracker';
import type { Media } from '@/types';

interface LocationWithMedia {
  id: string;
  tour_id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  audio_url: string | null;
  display_order: number;
  address: string | null;
  address_formatted: string | null;
  is_published: boolean;
  slug: string | null;
  created_at: string;
  updated_at: string;
  tour_name?: string;
  tour_slug?: string;
  media: (Media & { is_primary: boolean; display_order: number })[];
}

async function getLocation(locationId: string): Promise<LocationWithMedia | null> {
  const supabase = createClient();

  // Check if it looks like a UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(locationId);

  let query = supabase
    .from('sites')
    .select(`
      *,
      tour:tours(id, name, slug, is_published),
      site_media(
        display_order,
        is_primary,
        media:media_id(*)
      )
    `)
    .eq('is_published', true);

  if (isUUID) {
    query = query.eq('id', locationId);
  } else {
    query = query.eq('slug', locationId);
  }

  const { data: site, error } = await query.single();

  if (error || !site) {
    return null;
  }

  // Transform the response
  return {
    ...site,
    tour_name: site.tour?.name,
    tour_slug: site.tour?.slug,
    media: site.site_media
      ?.map((sm: { media: Media; is_primary: boolean; display_order: number }) => ({
        ...sm.media,
        is_primary: sm.is_primary,
        display_order: sm.display_order,
      }))
      .sort((a: { is_primary: boolean; display_order: number }, b: { is_primary: boolean; display_order: number }) =>
        b.is_primary ? 1 : a.display_order - b.display_order
      ) || [],
  } as LocationWithMedia;
}

export async function generateMetadata({ params }: { params: { locationId: string } }) {
  const location = await getLocation(params.locationId);

  if (!location) {
    return {
      title: 'Location Not Found',
    };
  }

  return {
    title: `${location.name} | Village Walking Tours`,
    description: location.description || `Visit ${location.name} on your walking tour`,
  };
}

export default async function LocationPage({ params }: { params: { locationId: string } }) {
  const location = await getLocation(params.locationId);

  if (!location) {
    notFound();
  }

  const primaryImage = location.media?.find((m) => m.is_primary) || location.media?.[0];
  const images = location.media?.filter((m) => m.file_type === 'image' && m.id !== primaryImage?.id) || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavigationHeader />

      {/* Hero Section */}
      <LocationHero
        name={location.name}
        primaryImage={primaryImage}
        address={location.address_formatted || location.address}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Walking Time Estimate */}
            <Card>
              <CardContent className="py-4">
                <WalkingTimeEstimate
                  latitude={location.latitude}
                  longitude={location.longitude}
                />
              </CardContent>
            </Card>

            {/* Description */}
            {location.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About this Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {location.description.split('\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Image Gallery */}
            {images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageGallery images={images} />
                </CardContent>
              </Card>
            )}

                      </div>

          {/* Right Column - Map & Actions */}
          <div className="space-y-6">
            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LocationMap
                  latitude={location.latitude}
                  longitude={location.longitude}
                  name={location.name}
                  primaryImage={primaryImage}
                />
              </CardContent>
            </Card>

            {/* Address */}
            {(location.address_formatted || location.address) && (
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#014487] mt-0.5" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-[#014487]">
                        {location.address_formatted || location.address}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Listen to Audio Button */}
            <ListenToAudioButton
              audioUrl={location.audio_url}
              siteId={location.id}
              siteName={location.name}
            />

            {/* Directions Button */}
            <DirectionsButton
              latitude={location.latitude}
              longitude={location.longitude}
              name={location.name}
            />

            {/* Link to Tour */}
            {location.tour_slug && location.tour_name && (
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <Route className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Part of Tour</p>
                      <Link
                        href={`/tour/${location.tour_slug}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {location.tour_name}
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Nearby Locations */}
        <div className="mt-12">
          <NearbyLocations
            currentLocationId={location.id}
            currentLatitude={location.latitude}
            currentLongitude={location.longitude}
          />
        </div>
      </main>

      <Footer />

      {/* Track arrival and show "see more sites" prompt */}
      <LocationArrivalTracker
        locationId={location.id}
        locationName={location.name}
        latitude={location.latitude}
        longitude={location.longitude}
      />
    </div>
  );
}
