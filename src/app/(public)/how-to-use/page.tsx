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

export const metadata = {
  title: 'How to Use | Village Walking Tours',
  description: 'Learn how to use the Village Walking Tours app to explore locations, navigate, listen to audio guides, and use offline mode.',
};

const features = [
  {
    icon: MapPin,
    title: 'Browse Locations',
    description:
      'Explore all available locations from the home page or use the Locations dropdown in the navigation. Each location has photos, descriptions, and audio guides.',
    steps: [
      'Click on "Locations" in the navigation bar',
      'Select a location from the dropdown menu',
      'Or browse tours from the home page and explore individual stops',
    ],
  },
  {
    icon: Map,
    title: 'Using the Map',
    description:
      'The interactive map shows all tour locations with markers. Tap markers to see details and distances from your current position.',
    steps: [
      'Allow location access when prompted for best experience',
      'Blue markers show unvisited locations',
      'Green markers show visited locations',
      'Red marker indicates your currently selected location',
      'Distance badges show how far each location is from you',
    ],
  },
  {
    icon: Navigation,
    title: 'Getting Directions',
    description:
      'Get turn-by-turn walking directions to any location using your preferred maps app.',
    steps: [
      'Open any location page',
      'Click "Get Directions" button',
      'Your maps app (Apple Maps or Google Maps) will open',
      'Follow the walking directions to reach the location',
    ],
  },
  {
    icon: Volume2,
    title: 'Audio Playback',
    description:
      'Listen to narrated audio guides at each location to learn about its history and significance.',
    steps: [
      'Navigate to a location with an audio guide',
      'Find the Audio Guide section on the page',
      'Press play to start listening',
      'Use skip buttons to jump forward or backward',
      'Audio will continue playing as you browse other content',
    ],
  },
  {
    icon: WifiOff,
    title: 'Offline Mode',
    description:
      'Download tour content to your device and access it even without an internet connection. Perfect for areas with poor signal.',
    steps: [
      'While connected to internet, open a tour page',
      'Click the "Download for Offline" button',
      'Wait for all content to download',
      'You can now access the tour without internet',
      'Cached content is stored for 7 days',
    ],
  },
  {
    icon: Bell,
    title: 'Proximity Notifications',
    description:
      'Receive notifications when you approach a point of interest on your walking tour.',
    steps: [
      'Enable notifications when prompted',
      'Set your preferred notification radius (default 100m)',
      'Keep the app open while walking',
      'Receive alerts as you approach locations',
      'Tap notifications to view location details',
    ],
  },
];

const tips = [
  {
    icon: Smartphone,
    title: 'Add to Home Screen',
    description:
      'For the best experience, add this app to your home screen. On iOS, tap Share then "Add to Home Screen". On Android, tap the menu and "Add to Home Screen".',
  },
  {
    icon: Download,
    title: 'Download Before You Go',
    description:
      'If you\'re visiting an area with poor mobile signal, download the tour content while you have Wi-Fi connection.',
  },
  {
    icon: Wifi,
    title: 'Save Data',
    description:
      'Once content is cached, you can use offline mode to avoid using mobile data during your walk.',
  },
];

export default function HowToUsePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationHeader />

      {/* Hero */}
      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How to Use</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Learn how to get the most out of Village Walking Tours. From browsing
            locations to using offline mode, we&apos;ve got you covered.
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Features */}
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

        {/* Tips */}
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

        {/* CTA */}
        <section className="mt-12 text-center py-8">
          <h2 className="text-xl font-semibold mb-4">Ready to Explore?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/">
                Browse Tours
                <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">
                Get Help
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
