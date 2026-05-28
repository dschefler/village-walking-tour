import Link from 'next/link';
import {
  MapPin,
  Navigation,
  Volume2,
  WifiOff,
  Bell,
  Smartphone,
  Map,
  ChevronRight,
  Bookmark,
  Route,
  Locate,
  Stamp,
  Lightbulb,
  Car,
  Footprints,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Footer } from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase/server';

async function getOrg(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('organizations')
    .select('name, app_name, curated_tours_enabled')
    .eq('slug', slug)
    .single();
  return data;
}

export default async function TenantHowToUsePage({
  params,
}: {
  params: { orgSlug: string };
}) {
  const org = await getOrg(params.orgSlug);
  const curatedToursEnabled = org?.curated_tours_enabled ?? true;
  const orgName = org?.app_name || org?.name || 'the walking tour';

  return (
    <div className="min-h-screen flex flex-col">
      <NavigationHeader orgSlug={params.orgSlug} />

      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How to Use</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Everything you need to get started — from installing the app and enabling GPS
            to building your own route and collecting stamps at each stop.
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl space-y-12">

        {/* ── Step 1: Install ── */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">1</span>
            Install the App on Your Phone
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                Add to Home Screen
              </CardTitle>
              <CardDescription>
                No app store required. Open {orgName} in your phone&apos;s browser, then follow
                the steps for your device to install it as a full-screen app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 space-y-1">
                <p className="text-sm font-semibold">iPhone · Safari</p>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                  <li>Tap the <strong>Share</strong> button (the box with an upward arrow at the bottom of the screen)</li>
                  <li>Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong></li>
                  <li>Tap <strong>&ldquo;Add&rdquo;</strong> in the top-right corner</li>
                </ol>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 space-y-1">
                <p className="text-sm font-semibold">iPhone · Chrome</p>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                  <li>Tap the <strong>Share</strong> button (box with arrow) at the bottom</li>
                  <li>Tap <strong>&ldquo;Add to Home Screen&rdquo;</strong></li>
                </ol>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 space-y-1">
                <p className="text-sm font-semibold">Android · Chrome</p>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                  <li>Tap the <strong>three-dot menu (⋮)</strong> in the top-right corner</li>
                  <li>Tap <strong>&ldquo;Add to Home screen&rdquo;</strong> or <strong>&ldquo;Install app&rdquo;</strong></li>
                </ol>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                Once installed, the tour opens like a regular app — full screen, no browser bar.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* ── Step 2: GPS ── */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">2</span>
            Enable GPS &amp; Location Access
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Locate className="w-5 h-5 text-primary" />
                </div>
                Why Location Access Matters
              </CardTitle>
              <CardDescription>
                GPS powers the best features of the tour. When you allow location access,
                the app can show how far you are from each site, auto-optimize your route
                starting from your current position, and alert you when you arrive at a stop.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 space-y-1">
                <p className="text-sm font-semibold">iPhone</p>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                  <li>When the app prompts you, tap <strong>&ldquo;Allow While Using App&rdquo;</strong></li>
                  <li>If you dismissed it, go to <strong>Settings → Privacy &amp; Security → Location Services</strong></li>
                  <li>Find your browser (Safari or Chrome) and set it to <strong>&ldquo;While Using&rdquo;</strong></li>
                </ol>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 space-y-1">
                <p className="text-sm font-semibold">Android</p>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                  <li>When prompted, tap <strong>&ldquo;Allow&rdquo;</strong> or <strong>&ldquo;Allow only while using the app&rdquo;</strong></li>
                  <li>If you dismissed it, go to <strong>Settings → Apps → Chrome → Permissions → Location</strong></li>
                </ol>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>If you deny location access, the app still works — you just won&apos;t see your distance to sites, arrival alerts, or GPS-optimized route ordering.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Step 3: Features ── */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">3</span>
            Features Guide
          </h2>
          <div className="space-y-4">

            {/* Browse Sites */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><MapPin className="w-5 h-5 text-primary" /></div>
                  Browse Historic Sites
                </CardTitle>
                <CardDescription>
                  View all available locations on an interactive map and scrollable list.
                  Each site shows a photo, address, description, and audio guide if available.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Tap <strong>&ldquo;Historic Sites&rdquo;</strong> in the navigation menu</li>
                  <li>Browse the list on the right or explore the map on the left</li>
                  <li>Tap any map marker to see a popup with photo and quick actions</li>
                  <li>Tap <strong>&ldquo;Details&rdquo;</strong> in the popup to visit the full location page</li>
                  <li>Tap <strong>&ldquo;Add to Tour&rdquo;</strong> to include a site in your custom tour</li>
                  <li>Tap the <strong>Audio</strong> button on any site card to listen to its narration</li>
                </ol>
              </CardContent>
            </Card>

            {/* Create Your Tour */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><Route className="w-5 h-5 text-primary" /></div>
                  Create Your Tour
                </CardTitle>
                <CardDescription>
                  Build a personalized walking or driving route. Select as many or as few stops
                  as you like — the app optimizes the order starting from your location.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Tap <strong>&ldquo;Create Your Tour&rdquo;</strong> in the navigation menu or homepage</li>
                  <li>Check the sites you want to visit from the list, or tap markers on the map</li>
                  <li>Tap <strong>&ldquo;Build Tour&rdquo;</strong> — the app will request your GPS location</li>
                  <li>Allow location access so your route starts from the nearest site</li>
                  <li>Review your optimized stop order, total distance, and estimated time</li>
                  <li>Use the <strong>Walk / Drive</strong> toggle to switch travel mode</li>
                  <li>Tap <strong>&ldquo;Open Walking Directions&rdquo;</strong> or <strong>&ldquo;Open Driving Directions&rdquo;</strong> to launch your maps app</li>
                </ol>
              </CardContent>
            </Card>

            {/* Walk vs Drive */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><Footprints className="w-5 h-5 text-primary" /></div>
                  Walking &amp; Driving Mode
                </CardTitle>
                <CardDescription>
                  Switch between walking and driving at any time. The app adjusts
                  estimated time, step count, and navigation directions accordingly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>After building your tour, find the <strong>Walk / Drive</strong> toggle in the route summary</li>
                  <li><strong>Walk mode</strong> shows estimated walk time and step count</li>
                  <li><strong>Drive mode</strong> shows estimated drive time (with road factor applied)</li>
                  <li>The map route updates automatically when you switch modes</li>
                  <li>Directions open in Apple Maps (iOS) or Google Maps (Android/desktop)</li>
                  <li>Individual site pages also have a <strong>&ldquo;Get Directions&rdquo;</strong> button that respects your current mode</li>
                </ol>
              </CardContent>
            </Card>

            {/* Curated Tours — conditional */}
            {curatedToursEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg"><Bookmark className="w-5 h-5 text-primary" /></div>
                    Curated Theme Tours
                  </CardTitle>
                  <CardDescription>
                    Pre-built tours grouped by topic, era, or time available.
                    Sites are pre-selected — customize them before you go.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Tap <strong>&ldquo;Curated Tours&rdquo;</strong> in the navigation menu</li>
                    <li>Read about each theme and see the sites it includes</li>
                    <li>Tap <strong>&ldquo;Start This Tour&rdquo;</strong> to load with sites pre-selected</li>
                    <li>Uncheck any sites you want to skip, or add more from the list</li>
                    <li>Tap <strong>&ldquo;Create Tour&rdquo;</strong> to build your optimized walking route</li>
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Using the Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><Map className="w-5 h-5 text-primary" /></div>
                  Using the Map
                </CardTitle>
                <CardDescription>
                  The interactive map shows all sites as markers. Tap any marker
                  for a quick summary — then add it to your tour or view full details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Allow location access to see your position on the map</li>
                  <li>Tap any marker to open a summary card with photo, address, and description</li>
                  <li>Sites already added to your tour show a <strong>checkmark</strong> on their marker</li>
                  <li>Hover or tap a list item to highlight its marker on the map</li>
                  <li>Tap <strong>&ldquo;Details&rdquo;</strong> in the popup card to visit the full location page</li>
                </ol>
              </CardContent>
            </Card>

            {/* Audio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><Volume2 className="w-5 h-5 text-primary" /></div>
                  Audio Narration
                </CardTitle>
                <CardDescription>
                  Many locations include a recorded audio guide. Listen while you stand
                  at the site to hear the full history and stories behind each place.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Open any location page — look for the <strong>Audio Guide</strong> section</li>
                  <li>Tap the <strong>play</strong> button to start listening</li>
                  <li>Use the <strong>skip forward / backward</strong> buttons to jump 15 seconds</li>
                  <li>Audio continues playing as you scroll the page or switch to another tab</li>
                  <li>On the Historic Sites list, tap the <strong>Audio</strong> button on any card to play a quick preview</li>
                  <li>Your phone volume controls the playback — turn it up before you arrive</li>
                </ol>
              </CardContent>
            </Card>

            {/* Arrival Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><Bell className="w-5 h-5 text-primary" /></div>
                  Arrival Alerts (GPS Notifications)
                </CardTitle>
                <CardDescription>
                  When you build a tour and keep the app open, you&apos;ll receive an automatic
                  alert as you physically approach each stop — no need to check the app constantly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Build a tour and tap <strong>&ldquo;Build Tour&rdquo;</strong></li>
                  <li>Allow location access when prompted — this is required for arrival alerts</li>
                  <li>Keep the app open on your screen as you walk</li>
                  <li>A card slides up automatically when you get within range of a stop</li>
                  <li>The alert shows the site name, photo, and an audio play button if available</li>
                  <li>Tap <strong>&ldquo;Next Stop&rdquo;</strong> to dismiss and continue your route</li>
                  <li>Toggle alerts on or off with the <strong>bell icon</strong> in the route summary</li>
                </ol>
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>Keep your screen on and the app in the foreground for alerts to fire reliably. Background GPS varies by device and browser.</p>
                </div>
              </CardContent>
            </Card>

            {/* Stamp Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><Stamp className="w-5 h-5 text-primary" /></div>
                  Stamp Card
                </CardTitle>
                <CardDescription>
                  Earn a digital stamp each time you visit a location during your tour.
                  Collect all the stamps to complete the tour.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Stamps are earned automatically when an arrival alert fires at a stop</li>
                  <li>A stamp animation plays on screen — look for it when you arrive</li>
                  <li>View your collected stamps in the tour progress section</li>
                  <li>When all stops are visited, a <strong>Tour Complete</strong> screen appears</li>
                  <li>Stamps are saved to your device — they persist if you close and reopen the app</li>
                </ol>
              </CardContent>
            </Card>

            {/* Fun Facts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><Lightbulb className="w-5 h-5 text-primary" /></div>
                  &ldquo;Did You Know?&rdquo; Fun Facts
                </CardTitle>
                <CardDescription>
                  Short pop-up facts appear as you explore each location page.
                  They highlight surprising details and hidden history.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Fun facts pop up automatically as you scroll through a location&apos;s page</li>
                  <li>Tap the card to dismiss it and continue reading</li>
                  <li>Each location can have multiple facts — they rotate as you visit</li>
                </ol>
              </CardContent>
            </Card>

            {/* Offline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><WifiOff className="w-5 h-5 text-primary" /></div>
                  Offline Access
                </CardTitle>
                <CardDescription>
                  Pages are cached as you browse them. Once loaded, they&apos;re available
                  even without a data connection — useful in areas with poor signal.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Browse all your planned stops at home while on Wi-Fi</li>
                  <li>Pages and images are saved automatically as you visit them</li>
                  <li>Return to any previously visited page without internet</li>
                  <li>For best results, open every location page before heading out</li>
                </ol>
              </CardContent>
            </Card>

            {/* Share */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><Share2 className="w-5 h-5 text-primary" /></div>
                  Share the App
                </CardTitle>
                <CardDescription>
                  Share the tour with friends and family via QR code, a direct link, or your phone&apos;s native share sheet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Scroll to the bottom of any page and tap <strong>&ldquo;Share this App&rdquo;</strong> in the footer</li>
                  <li>Scan the QR code with another phone&apos;s camera to open the tour instantly</li>
                  <li>Tap <strong>&ldquo;Copy&rdquo;</strong> to copy the link and paste it into a text or email</li>
                  <li>Tap <strong>&ldquo;Send via Text / Email / More&rdquo;</strong> to use your phone&apos;s built-in share options</li>
                </ol>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* ── Tips ── */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Tips for the Best Experience</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Smartphone,
                title: 'Install Before You Go',
                body: 'Add the app to your home screen at home so it opens instantly when you\'re out exploring.',
              },
              {
                icon: Locate,
                title: 'Allow Location Access',
                body: 'GPS enables arrival alerts, nearest-stop routing, and distance badges. It won\'t drain your battery significantly.',
              },
              {
                icon: Volume2,
                title: 'Turn Volume Up',
                body: 'Audio narrations play through your phone speaker. Raise your volume before you arrive at each site.',
              },
              {
                icon: WifiOff,
                title: 'Browse Before You Leave',
                body: 'Open each location page at home on Wi-Fi — the app caches them so you won\'t need data in the field.',
              },
              {
                icon: Bell,
                title: 'Keep the App Open',
                body: 'Arrival alerts require the app to be in the foreground. Keep your screen on as you walk between stops.',
              },
              {
                icon: Car,
                title: 'Driving to Sites?',
                body: 'Use the Drive toggle in your tour summary. Directions open in Apple Maps (iPhone) or Google Maps (Android).',
              },
            ].map((tip) => (
              <Card key={tip.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <tip.icon className="w-4 h-4 text-primary" />
                    {tip.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{tip.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="text-center py-8 border-t">
          <h2 className="text-xl font-semibold mb-2">Ready to Explore?</h2>
          <p className="text-muted-foreground mb-6 text-sm">Start by browsing all available historic sites, or jump straight into building your route.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href={`/t/${params.orgSlug}/historic-sites`}>
                Browse Historic Sites
                <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={`/t/${params.orgSlug}/create-your-tour`}>Create Your Tour</Link>
            </Button>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
