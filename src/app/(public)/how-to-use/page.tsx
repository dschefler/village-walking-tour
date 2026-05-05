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
  Bookmark,
  Route,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'How to Use | Southampton Village Walking Tour',
  description: 'Learn how to explore historic sites, build a custom tour, use audio guides, and get the most from the Southampton Village Walking Tour app.',
};

const features = [
  {
    icon: MapPin,
    title: 'Start Exploring',
    description:
      'Browse all historic locations from the Historic Sites page. View them on an interactive map or scroll the full list — each location shows a photo, address, and description.',
    steps: [
      'Tap "Historic Sites" in the navigation menu',
      'Scroll the list on the right or explore the map on the left',
      'Tap any map marker to see a popup with the site\'s photo and details',
      'Tap "Details" in the popup to visit the full location page',
      'Tap "Add to Tour" to include a site in your custom tour',
    ],
  },
  {
    icon: Route,
    title: 'Create Your Tour',
    description:
      'Build a custom walking route using three different starting points — browse the site list, pick stops from the map, or choose a curated theme.',
    steps: [
      'Tap "Create Your Tour" in the navigation menu',
      'Choose your method: Select Sites, View by Map, or Curated Tours',
      'Select Sites: check off the locations you want to visit from the list',
      'View by Map: tap markers on the map to add or remove stops',
      'Curated Tours: pick a theme — matching sites are auto-selected, and you can customize from there',
      'Tap "Create Tour" to generate your optimized walking route',
    ],
  },
  {
    icon: Bookmark,
    title: 'Curated Theme Tours',
    description:
      'Explore Southampton through themed tours built around specific chapters of local history — Black history, the Revolutionary era, and veterans of our armed forces.',
    steps: [
      'Tap "Curated Tours" in the navigation menu',
      'Read about each theme and see the sites it includes',
      'Tap "Start This Tour" to load the tour with sites pre-selected',
      'Uncheck any sites you want to skip, or add more from the list',
      'Tap "Create Tour" to build your optimized walking route',
    ],
  },
  {
    icon: Map,
    title: 'Using the Map',
    description:
      'The interactive map on the Historic Sites page shows all tour locations. Tap any marker to see a summary card with photo, address, and quick actions.',
    steps: [
      'Allow location access when prompted for the best experience',
      'Tap any marker to open a popup card with photo and description',
      'Tap "Add to Tour" in the popup to include that site in your tour',
      'Tap "Details" to go to the full location page',
      'Markers with a checkmark are already added to your tour',
      'Hover over a list item to highlight its marker on the map',
    ],
  },
  {
    icon: Navigation,
    title: 'Getting Directions',
    description:
      'Get turn-by-turn walking directions to any location using your preferred maps app.',
    steps: [
      'Open any location\'s detail page',
      'Tap the "Get Directions" button',
      'Your maps app (Apple Maps or Google Maps) will open',
      'Follow the walking directions to reach the site',
    ],
  },
  {
    icon: Volume2,
    title: 'Audio Guides',
    description:
      'Many locations include a narrated audio guide. Listen while you walk to learn the history and significance of each site.',
    steps: [
      'Open any location page — look for the Audio Guide section',
      'Tap the play button to start listening',
      'Use the skip buttons to jump forward or backward',
      'Audio keeps playing as you scroll the page',
    ],
  },
  {
    icon: WifiOff,
    title: 'Offline Access',
    description:
      'Pages are cached automatically as you browse. Revisit them anytime without an internet connection — perfect for areas with poor signal.',
    steps: [
      'Browse your planned tour stops while connected to Wi-Fi or data',
      'Content is saved to your device automatically as you visit pages',
      'Return to any previously visited page without internet',
      'For best results, browse all your stops before heading out',
    ],
  },
  {
    icon: Bell,
    title: 'Proximity Notifications',
    description:
      'Receive an alert as you approach each point of interest on your walking tour.',
    steps: [
      'Allow notifications and location access when prompted',
      'Keep the app open while walking',
      'You\'ll receive an alert as you get close to each location',
      'Tap the notification to view the location\'s details',
    ],
  },
];

const tips = [
  {
    icon: Smartphone,
    title: 'Add to Home Screen',
    description:
      'Install the app for the best experience. iPhone (Safari): tap the Share button (box with arrow) then "Add to Home Screen." iPhone (Chrome): tap Share then "Add to Home Screen." Android: tap the three-dot menu (⋮) and "Add to Home screen" or "Install app."',
  },
  {
    icon: Download,
    title: 'Browse Before You Go',
    description:
      'Visit your planned tour stops at home while on Wi-Fi. Pages load automatically in the background, so you can access them later without a data connection.',
  },
  {
    icon: Wifi,
    title: 'Save Mobile Data',
    description:
      'Once pages are cached, you won\'t need a data connection to revisit them — great for exploring without burning through your mobile data.',
  },
];

export default function HowToUsePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationHeader />
      <Breadcrumb items={[{ label: 'How to Use' }]} />

      {/* Hero */}
      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How to Use</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Everything you need to know to explore Southampton Village — from browsing
            historic sites to building your own custom walking tour.
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
              <Link href="/historic-sites">
                Start Exploring
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
