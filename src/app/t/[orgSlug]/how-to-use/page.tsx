import Link from 'next/link';
import {
  MapPin,
  Navigation,
  Volume2,
  Wifi,
  WifiOff,
  Bell,
  Smartphone,
  Map,
  Download,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Footer } from '@/components/layout/Footer';

const features = [
  {
    icon: MapPin,
    title: 'Browse Locations',
    description: 'Explore all available locations from the home page or use the Locations dropdown in the navigation.',
    steps: [
      'Click on "Locations" in the navigation bar',
      'Select a location from the dropdown menu',
      'Or browse tours from the home page and explore individual stops',
    ],
  },
  {
    icon: Map,
    title: 'Using the Map',
    description: 'The interactive map shows all tour locations with markers. Tap markers to see details.',
    steps: [
      'Allow location access when prompted for best experience',
      'Blue markers show unvisited locations',
      'Green markers show visited locations',
      'Distance badges show how far each location is from you',
    ],
  },
  {
    icon: Navigation,
    title: 'Getting Directions',
    description: 'Get turn-by-turn walking directions to any location.',
    steps: [
      'Open any location page',
      'Click "Get Directions" button',
      'Your maps app will open with walking directions',
    ],
  },
  {
    icon: Volume2,
    title: 'Audio Playback',
    description: 'Listen to narrated audio guides at each location.',
    steps: [
      'Navigate to a location with an audio guide',
      'Press play to start listening',
      'Audio will continue playing as you browse other content',
    ],
  },
  {
    icon: WifiOff,
    title: 'Offline Mode',
    description: 'Download tour content to your device for areas with poor signal.',
    steps: [
      'While connected, open a tour page',
      'Click "Download for Offline"',
      'You can now access the tour without internet',
    ],
  },
  {
    icon: Bell,
    title: 'Proximity Notifications',
    description: 'Receive notifications when you approach a point of interest.',
    steps: [
      'Enable notifications when prompted',
      'Keep the app open while walking',
      'Receive alerts as you approach locations',
    ],
  },
];

const tips = [
  {
    icon: Smartphone,
    title: 'Add to Home Screen',
    description: 'For the best experience, add this app to your home screen.',
  },
  {
    icon: Download,
    title: 'Download Before You Go',
    description: 'Download tour content while you have Wi-Fi.',
  },
  {
    icon: Wifi,
    title: 'Save Data',
    description: 'Once content is cached, use offline mode to save mobile data.',
  },
];

export default function TenantHowToUsePage({
  params,
}: {
  params: { orgSlug: string };
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationHeader orgSlug={params.orgSlug} />

      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How to Use</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Learn how to get the most out of your walking tour experience.
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Features Guide</h2>
          <div className="grid gap-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    {feature.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold">Pro Tips</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {tips.map((tip) => (
              <Card key={tip.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <tip.icon className="w-4 h-4 text-primary" />
                    {tip.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-12 text-center py-8">
          <h2 className="text-xl font-semibold mb-4">Ready to Explore?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href={`/t/${params.orgSlug}`}>
                Browse Tours
                <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={`/t/${params.orgSlug}/contact`}>Get Help</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
