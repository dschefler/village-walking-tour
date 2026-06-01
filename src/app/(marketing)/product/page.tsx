import type { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin,
  Stamp,
  WifiOff,
  Palette,
  Smartphone,
  Check,
  Volume2,
  Lightbulb,
  Paintbrush,
  Clock,
  Car,
  BellRing,
  Route,
  Bookmark,
  QrCode,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Note: Check, Card imports kept for features/DFY sections above
import { WhoItsForGrid } from '@/components/marketing/WhoItsForGrid';
import { TrialCTA } from '@/components/marketing/TrialCTA';
import { WalkingAnimation } from '@/components/marketing/WalkingAnimation';
import { PricingSection } from '@/components/marketing/PricingSection';
import { CheckoutButton } from '@/components/marketing/CheckoutButton';
import { createServiceClient } from '@/lib/supabase/server';

export const revalidate = 300; // re-fetch content every 5 min

export const metadata: Metadata = {
  title: 'Walking Tour Builder | Create GPS Walking Tour Apps for Your Community',
  description:
    'Build branded, GPS-guided walking tour apps with stamp cards, AI audio narration, and offline support. Perfect for towns, museums, parks, and historical societies. Start your free 7-day trial.',
  keywords: [
    'walking tour app builder',
    'self-guided walking tour software',
    'create walking tour app',
    'historic district tour app',
    'GPS walking tour',
    'no-code tour builder',
    'walking tour platform',
    'community tour app',
    'museum audio tour app',
    'heritage trail app',
  ],
  alternates: {
    canonical: 'https://walkingtourbuilder.com',
  },
  openGraph: {
    title: 'Walking Tour Builder — GPS Tour Apps for Communities',
    description:
      'Build branded, GPS-guided walking tour apps in minutes. Stamp cards, AI audio narration, offline support. Start your free trial — no credit card required.',
    type: 'website',
    url: 'https://walkingtourbuilder.com',
    siteName: 'Walking Tour Builder',
    images: [
      {
        url: 'https://walkingtourbuilder.com/images/wtb-social.jpg',
        width: 1200,
        height: 630,
        alt: 'Walking Tour Builder — Build GPS walking tour apps in minutes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Walking Tour Builder',
    description:
      'Build branded GPS walking tour apps for your community. Stamp cards, audio narration, offline support. Free 7-day trial.',
    images: ['https://walkingtourbuilder.com/images/wtb-social.jpg'],
  },
};

const DEFAULTS = {
  hero_headline: 'Build a Walking Tour App for Your Community',
  hero_subheadline:
    'Create branded, GPS-guided walking tour apps with stamp cards, AI audio narration, and offline support — in minutes, not months.',
  trial_days: '7',
  pricing_subheadline: 'Start with a 7-day free trial. No credit card required.',
  dfy_label: 'Tour Builder Concierge',
  dfy_headline: 'Rather Have Us Build It For You?',
  dfy_subheadline:
    'Our team handles everything — branding, content entry, audio narration, and launch. You provide the materials; we deliver a ready-to-share tour app.',
  cta_headline: 'Ready to Build Your Walking Tour?',
  cta_subheadline:
    'Join towns, museums, parks, and historical societies who use Walking Tour Builder to share their stories with the world.',
};

async function getContent(): Promise<typeof DEFAULTS> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase.from('marketing_content').select('key, value');
    if (!data) return DEFAULTS;
    const overrides: Record<string, string> = {};
    data.forEach((row) => { overrides[row.key] = row.value; });
    return { ...DEFAULTS, ...overrides };
  } catch {
    return DEFAULTS;
  }
}

const features = [
  {
    icon: MapPin,
    title: 'GPS Navigation',
    description: 'Turn-by-turn directions to every stop, with live distance and step counts. Works outdoors where it matters.',
  },
  {
    icon: Car,
    title: 'Walk or Drive Mode',
    description: 'Visitors choose how they explore. Walking mode gives step counts and pace; driving mode gives road distances and time.',
  },
  {
    icon: BellRing,
    title: 'Arrival Alerts',
    description: 'Visitors get a notification the moment they arrive near a site — no more squinting at a map to know they\'ve arrived.',
  },
  {
    icon: Route,
    title: 'Create Your Own Tour',
    description: 'Visitors pick their own stops and get a custom optimized route. Great for repeat visits and different interests.',
  },
  {
    icon: Bookmark,
    title: 'Curated Tours',
    description: 'Offer pre-built themed routes — a family walk, an art trail, a history deep-dive — right from your homepage.',
  },
  {
    icon: Stamp,
    title: 'Stamp Cards',
    description: 'Visitors collect digital stamps at each site. Gamification keeps them engaged and coming back.',
  },
  {
    icon: Volume2,
    title: 'AI Audio Narration',
    description: 'Generate professional narration from your site descriptions with one click. No studio, no voice actor needed.',
  },
  {
    icon: Lightbulb,
    title: '"Did You Know?" Facts',
    description: 'Surprise visitors with pop-up fun facts as they explore each stop. Makes every visit feel a little magical.',
  },
  {
    icon: WifiOff,
    title: 'Offline Support',
    description: 'Tours work without internet. Perfect for areas with spotty or no cell service.',
  },
  {
    icon: Palette,
    title: 'Your Branding',
    description: 'Custom colors, logo, and domain. It looks like your app, not ours — because it is.',
  },
  {
    icon: QrCode,
    title: 'Instant Sharing & QR Codes',
    description: 'Visitors share the app via a QR code that opens your tour instantly. Perfect for posters, brochures, and signage.',
  },
  {
    icon: Heart,
    title: 'Donation Support',
    description: 'Accept donations directly through the app. Ideal for historical societies, nonprofits, and volunteer-run tours.',
  },
];


const buildPackages = [
  {
    name: 'Essential Build',
    price: '$799',
    period: 'one-time setup fee',
    pairsWith: 'Best with Starter plan',
    timeline: '7–10 business days',
    scope: '1 tour · up to 10 sites',
    priceKey: 'essential_build' as const,
    features: [
      'Branding setup (logo, colors, fonts)',
      'Custom domain configuration',
      'Content entry from your materials',
      'AI audio narration for all sites',
      'Photo upload & optimization',
      'Quality review & launch testing',
    ],
  },
  {
    name: 'Professional Build',
    price: '$1,799',
    period: 'one-time setup fee',
    pairsWith: 'Best with Pro plan',
    timeline: '10–15 business days',
    scope: 'Up to 3 tours · up to 25 sites each',
    priceKey: 'professional_build' as const,
    features: [
      'Everything in Essential Build',
      'Multi-tour navigation & structure',
      'Custom descriptions from your notes',
      'Advanced image editing & layout',
      'Dedicated project coordinator',
      'Revision round included',
    ],
    popular: true,
  },
  {
    name: 'Enterprise Build',
    price: '$3,499',
    period: 'one-time setup fee',
    pairsWith: 'Best with Enterprise plan',
    timeline: '15–21 business days',
    scope: 'Up to 8 tours · up to 40 sites each',
    priceKey: 'enterprise_build' as const,
    features: [
      'Everything in Professional Build',
      'Kick-off strategy session',
      'Content writing from provided notes',
      'Two revision rounds included',
      'Priority launch support',
      'Custom scope beyond limits by quote',
    ],
  },
];

export default async function MarketingLandingPage() {
  const content = await getContent();
  const trialDays = content.trial_days || '7';

  const stats = [
    { value: 'No-code', label: 'Setup required' },
    { value: `${trialDays}-day`, label: 'Free trial' },
    { value: 'Any device', label: 'iOS & Android' },
    { value: 'Offline', label: 'Works without WiFi' },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Walking Tour Builder',
    description: 'Build branded, GPS-guided walking tour apps with stamp cards, AI audio narration, and offline support. Perfect for towns, museums, parks, and historical societies.',
    url: 'https://walkingtourbuilder.com',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: `${trialDays}-day free trial, no credit card required`,
    },
    provider: {
      '@type': 'Organization',
      name: 'Walking Tour Builder',
      url: 'https://walkingtourbuilder.com',
    },
    featureList: [
      'GPS-guided navigation',
      'AI audio narration',
      'Digital stamp cards',
      'Offline support',
      'Walk or drive mode',
      'Arrival alerts',
      'Custom branding',
      'QR code sharing',
    ],
    audience: {
      '@type': 'Audience',
      audienceType: 'Towns, museums, parks, historical societies, tourism organizations',
    },
  };

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 flex h-14 items-center justify-between">
          <Link href="/product" className="flex items-center gap-2">
            <svg width="28" height="34" viewBox="0 0 28 34" fill="none" aria-hidden="true">
              <path d="M14 0C8.48 0 4 4.48 4 10c0 7.5 10 18 10 18S24 17.5 24 10c0-5.52-4.48-10-10-10z" fill="#1A6B5F"/>
              <circle cx="14" cy="10" r="4" fill="white" opacity="0.85"/>
              <circle cx="4" cy="26" r="1.8" fill="#CA7040"/>
              <circle cx="9" cy="29" r="1.8" fill="#CA7040"/>
              <circle cx="14" cy="31" r="1.8" fill="#CA7040"/>
              <circle cx="19" cy="29" r="1.8" fill="#CA7040"/>
              <circle cx="24" cy="26" r="1.8" fill="#CA7040"/>
            </svg>
            <span className="font-bold text-base leading-tight">
              <span className="block text-[#1A6B5F]">Walking Tour</span>
              <span className="block text-[#CA7040]">Builder</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <a href="https://southamptonwalkingtour.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
              Live Demo
            </a>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Log In</Link>
            </Button>
            <TrialCTA label="Start Free Trial" size="sm" />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 md:pt-24 pb-10 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/wtb-logo-hero.png"
            alt="Walking Tour Builder"
            className="mx-auto mb-8"
            style={{ height: '260px', width: 'auto' }}
          />
          <div className="inline-flex items-center gap-2 bg-white/15 text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Smartphone className="w-4 h-4" />
            No app store. No coding. Just your tour.
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto">
            {content.hero_headline}
          </h1>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            {content.hero_subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <TrialCTA
              label={`Start Free ${trialDays}-Day Trial`}
              size="lg"
              className="text-lg px-8 bg-accent text-accent-foreground hover:bg-[#C46538]"
              showArrow
            />
            <Button asChild size="lg" className="text-lg px-8 !bg-transparent border border-white/50 text-white hover:!bg-white/10 hover:text-white rounded-lg">
              <a href="https://southamptonwalkingtour.com" target="_blank" rel="noopener noreferrer">
                See Live Demo
              </a>
            </Button>
          </div>
          <p className="text-sm text-primary-foreground/70 mt-4">
            No credit card required. Full Pro features during trial.
          </p>

          {/* Stats bar */}
          <div className="mt-10 pb-2 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-bold text-primary-foreground">{stat.value}</div>
                <div className="text-sm text-primary-foreground/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Walking animation — sits at top of white section */}
      <div className="bg-background flex justify-center pt-6 pb-0">
        <WalkingAnimation />
      </div>

      {/* Who It's For — animated grid */}
      <WhoItsForGrid />

      {/* Features */}
      <section className="py-20 bg-primary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete toolkit for creating professional walking tour experiences your visitors will love.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">See It In Action</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            The Southampton Village Walking Tour was built with this platform.
            Explore it live — the same experience your visitors will have.
          </p>
          <Button asChild size="lg" variant="outline">
            <a href="https://southamptonwalkingtour.com" target="_blank" rel="noopener noreferrer" className="gap-2 inline-flex items-center">
              <MapPin className="w-5 h-5" />
              Explore Southampton Tour
            </a>
          </Button>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection pricingSubheadline={content.pricing_subheadline} />

      {/* Done For You */}
      <section id="done-for-you" className="py-20 bg-gradient-to-b from-amber-50 to-background border-y border-amber-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <span className="text-sm font-semibold uppercase tracking-widest text-amber-700 mb-3 block">
              {content.dfy_label}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {content.dfy_headline}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {content.dfy_subheadline}
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-12 flex-wrap">
            <span className="flex items-center gap-1.5"><Paintbrush className="w-4 h-4 text-amber-600" /> Custom branding</span>
            <span className="flex items-center gap-1.5"><Volume2 className="w-4 h-4 text-amber-600" /> Audio narration</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-amber-600" /> Quality tested</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-600" /> Fast turnaround</span>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {buildPackages.map((pkg) => (
              <Card
                key={pkg.name}
                className={pkg.popular ? 'border-amber-400 shadow-lg relative' : 'border-border'}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <div className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 w-fit">
                    {pkg.pairsWith}
                  </div>
                  <div className="pt-1">
                    <span className="text-3xl font-bold">{pkg.price}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{pkg.period}</p>
                  </div>
                  <div className="text-sm font-medium text-foreground">{pkg.scope}</div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {pkg.timeline}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <CheckoutButton
                    priceKey={pkg.priceKey}
                    label="Get Started"
                    className={`w-full ${pkg.popular ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                    variant={pkg.popular ? 'default' : 'outline'}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add-ons */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              <span className="font-medium text-foreground">Add-ons:</span>{' '}
              Additional site +$49 &nbsp;·&nbsp; Additional tour +$349 &nbsp;·&nbsp; Rush delivery (timeline halved) +$299
            </p>
          </div>

          {/* Fine print */}
          <div className="mt-6 max-w-2xl mx-auto bg-muted/50 border rounded-lg px-5 py-4 text-xs text-muted-foreground space-y-1.5">
            <p className="font-medium text-foreground text-sm">Important — Please Read</p>
            <p>Each build package is provided to a single organization for its own use only and may not be resold, transferred, or used to create tours on behalf of third parties without a separate agreement.</p>
            <p>Setup fees are <strong>non-refundable once work has commenced</strong>. A full refund is available if cancelled before work begins. A 50% refund is available if cancelled within 3 business days of project kickoff. No refund is available after that point.</p>
            <p>The client is responsible for supplying accurate content, images, and branding materials. Delivery timelines are estimates and begin upon receipt of all required materials.</p>
            <p>
              All services are subject to our{' '}
              <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {content.cta_headline}
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            {content.cta_subheadline}
          </p>
          <TrialCTA
            label="Get Started Free"
            size="lg"
            className="text-lg px-8 bg-accent text-accent-foreground hover:bg-[#C46538]"
            showArrow
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Walking Tour Builder. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="https://southamptonwalkingtour.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Demo</a>
            <Link href="#pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="#done-for-you" className="hover:text-foreground">Done For You</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/login" className="hover:text-foreground">Log In</Link>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
