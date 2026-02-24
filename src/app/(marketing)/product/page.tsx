import Link from 'next/link';
import {
  MapPin,
  Stamp,
  Wifi,
  WifiOff,
  Palette,
  Smartphone,
  ChevronRight,
  Check,
  Volume2,
  Lightbulb,
  BarChart3,
  Paintbrush,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WhoItsForGrid } from '@/components/marketing/WhoItsForGrid';
import { TrialCTA } from '@/components/marketing/TrialCTA';
import { WalkingAnimation } from '@/components/marketing/WalkingAnimation';
import { createServiceClient } from '@/lib/supabase/server';

export const revalidate = 300; // re-fetch content every 5 min

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
    description: 'Turn-by-turn walking directions to every tour stop. Works outdoors where it matters.',
  },
  {
    icon: Stamp,
    title: 'Stamp Cards',
    description: 'Visitors collect stamps as they visit each site. Gamification keeps them engaged.',
  },
  {
    icon: Volume2,
    title: 'AI Audio Narration',
    description: 'Generate professional narration from your descriptions with one click. No studio needed.',
  },
  {
    icon: WifiOff,
    title: 'Offline Support',
    description: 'Tours work without internet. Perfect for areas with spotty or no cell service.',
  },
  {
    icon: Palette,
    title: 'Your Branding',
    description: 'Custom colors, logo, and domain. It looks like your app, not ours.',
  },
  {
    icon: Smartphone,
    title: 'Installable PWA',
    description: 'Installs on any phone from a share link. No app store submission required.',
  },
  {
    icon: Lightbulb,
    title: '"Did You Know?" Facts',
    description: 'Surprise visitors with fun facts and audio tidbits as they explore each stop.',
  },
  {
    icon: Wifi,
    title: 'Hours & Directions',
    description: 'Show visiting hours, addresses, and one-tap navigation to each location.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'See which stops visitors engage with most and track tour completions.',
  },
];

const pricingTiers = [
  {
    name: 'Starter',
    price: '$79',
    period: '/mo',
    description: 'Perfect for a single tour',
    features: ['1 tour', '10 sites', '5 media per site', 'Stamp card', 'GPS navigation', 'Offline support'],
  },
  {
    name: 'Pro',
    price: '$149',
    period: '/mo',
    description: 'For organizations with multiple tours',
    features: ['5 tours', '25 sites per tour', 'Unlimited media', 'Custom domain', 'Analytics dashboard', 'Priority support'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$299',
    period: '/mo',
    description: 'For large organizations',
    features: ['Up to 15 tours', 'Up to 50 sites per tour', 'White-label mode', 'Team members', 'API access', 'Dedicated support'],
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 flex h-14 items-center justify-between">
          <Link href="/" className="font-bold text-lg">
            Walking Tour Builder
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/t/southampton" className="text-sm text-muted-foreground hover:text-foreground">
              Live Demo
            </Link>
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
      <section className="pt-16 md:pt-24 pb-0 bg-gradient-to-b from-primary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Smartphone className="w-4 h-4" />
            No app store. No coding. Just your tour.
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto">
            {content.hero_headline}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {content.hero_subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <TrialCTA
              label={`Start Free ${trialDays}-Day Trial`}
              size="lg"
              className="text-lg px-8 bg-accent text-accent-foreground hover:bg-[#C46538]"
              showArrow
            />
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="/t/southampton">
                See Live Demo
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required. Full Pro features during trial.
          </p>

          {/* Stats bar */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Walking animation — plays once then fades out */}
        <WalkingAnimation />
      </section>

      {/* Who It's For — animated grid */}
      <WhoItsForGrid />

      {/* Features */}
      <section className="py-20">
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
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">See It In Action</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            The Southampton Village Walking Tour was built with this platform.
            Explore it live — the same experience your visitors will have.
          </p>
          <Button asChild size="lg" variant="outline">
            <Link href="/t/southampton" className="gap-2">
              <MapPin className="w-5 h-5" />
              Explore Southampton Tour
            </Link>
          </Button>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-muted-foreground">
              {content.pricing_subheadline}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={tier.popular ? 'border-primary shadow-lg relative' : ''}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="pt-2">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <TrialCTA
                    label="Start Free Trial"
                    className="w-full mt-6"
                    variant={tier.popular ? 'default' : 'outline'}
                    plan={tier.name}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6 max-w-2xl mx-auto">
            Each subscription is licensed to a single organization for its own use only. Subscriptions may not be shared across multiple unrelated organizations or used to create and manage tours on behalf of third parties without a separate license for each. See our{' '}
            <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link> for full details.
          </p>
        </div>
      </section>

      {/* Done For You */}
      <section id="done-for-you" className="py-20 bg-gradient-to-b from-amber-50/60 to-background border-y border-amber-100">
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
                  <Button
                    asChild
                    className={`w-full ${pkg.popular ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                    variant={pkg.popular ? 'default' : 'outline'}
                  >
                    <Link href="mailto:hello@walkingtourbuilder.com?subject=Done-For-You Build Inquiry">
                      Get Started
                    </Link>
                  </Button>
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
            <Link href="/t/southampton" className="hover:text-foreground">Demo</Link>
            <Link href="#pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="#done-for-you" className="hover:text-foreground">Done For You</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/login" className="hover:text-foreground">Log In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
