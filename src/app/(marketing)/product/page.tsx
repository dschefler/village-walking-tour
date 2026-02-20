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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: MapPin,
    title: 'GPS Navigation',
    description: 'Turn-by-turn walking directions to every tour stop.',
  },
  {
    icon: Stamp,
    title: 'Stamp Cards',
    description: 'Visitors collect stamps as they visit each site. Gamification built in.',
  },
  {
    icon: WifiOff,
    title: 'Offline Support',
    description: 'Tours work without internet. Perfect for areas with spotty service.',
  },
  {
    icon: Palette,
    title: 'Your Branding',
    description: 'Custom colors, logo, and domain. It looks like your app, not ours.',
  },
  {
    icon: Smartphone,
    title: 'Installable PWA',
    description: 'Installs on any phone from a link. No app store needed.',
  },
  {
    icon: Wifi,
    title: 'Audio Narration',
    description: 'Add audio guides visitors can listen to at each stop.',
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
    features: ['Unlimited tours', 'Unlimited sites', 'White-label mode', 'Team members', 'API access', 'Dedicated support'],
  },
];

export default function MarketingLandingPage() {
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
            <Button asChild size="sm">
              <Link href="/signup">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto">
            Build Walking Tours for Your Community
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create branded, GPS-guided walking tour apps with stamp cards, audio
            narration, and offline support. No coding required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 bg-accent text-accent-foreground hover:bg-[#C46538]">
              <Link href="/signup">
                Start Free 14-Day Trial
                <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="/t/southampton">
                See Live Demo
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required. Full Pro features during trial.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete toolkit for creating professional walking tour experiences.
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
            Explore it live.
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
              Start with a 14-day free trial. No credit card required.
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
                  <Button
                    asChild
                    className="w-full mt-6"
                    variant={tier.popular ? 'default' : 'outline'}
                  >
                    <Link href="/signup">Start Free Trial</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Build Your Walking Tour?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join towns, museums, and historical societies who use Walking Tour
            Builder to share their stories.
          </p>
          <Button asChild size="lg" className="text-lg px-8 bg-accent text-accent-foreground hover:bg-[#C46538]">
            <Link href="/signup">
              Get Started Free
              <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Walking Tour Builder</p>
          <div className="flex gap-6">
            <Link href="/t/southampton" className="hover:text-foreground">Demo</Link>
            <Link href="#pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="/login" className="hover:text-foreground">Log In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
