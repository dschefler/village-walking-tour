import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const tiers = [
  {
    name: 'Starter',
    price: '$79',
    period: '/mo',
    description: 'Perfect for a single walking tour',
    features: ['1 tour', '10 sites', '5 media per site', 'Stamp card', 'GPS navigation', 'Offline support', 'PWA install'],
  },
  {
    name: 'Pro',
    price: '$149',
    period: '/mo',
    description: 'For organizations with multiple tours',
    features: ['5 tours', '25 sites per tour', 'Unlimited media', 'Custom domain', 'Analytics dashboard', 'Audio narration', 'Priority support'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$299',
    period: '/mo',
    description: 'For large organizations and destinations',
    features: ['Unlimited tours', 'Unlimited sites', 'White-label mode', 'Team members', 'API access', 'Custom integrations', 'Dedicated support'],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 flex h-14 items-center justify-between">
          <Link href="/" className="font-bold text-lg">Walking Tour Builder</Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Start with a 14-day free trial with full Pro features. No credit card required.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {tiers.map((tier) => (
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
                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="w-full"
                    variant={tier.popular ? 'default' : 'outline'}
                  >
                    <Link href="/signup">Start Free Trial</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
