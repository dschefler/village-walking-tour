'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckoutButton } from '@/components/marketing/CheckoutButton';
import type { PriceKey } from '@/lib/stripe';

const tiers: {
  name: string;
  monthly: number;
  annual: number;
  annualTotal: number;
  description: string;
  features: string[];
  popular?: boolean;
  monthlyKey: PriceKey;
  annualKey: PriceKey;
}[] = [
  {
    name: 'Starter',
    monthly: 99,
    annual: 79,
    annualTotal: 948,
    description: 'Perfect for a single tour',
    features: ['1 tour', '10 sites', '5 media per site', 'Stamp card', 'GPS navigation', 'Offline support'],
    monthlyKey: 'starter_monthly',
    annualKey: 'starter_annual',
  },
  {
    name: 'Pro',
    monthly: 179,
    annual: 149,
    annualTotal: 1788,
    description: 'For organizations with multiple tours',
    features: ['5 tours', '25 sites per tour', 'Unlimited media', 'Custom domain', 'Analytics dashboard', 'Priority support'],
    popular: true,
    monthlyKey: 'pro_monthly',
    annualKey: 'pro_annual',
  },
  {
    name: 'Enterprise',
    monthly: 349,
    annual: 299,
    annualTotal: 3588,
    description: 'For large organizations',
    features: ['Up to 15 tours', 'Up to 50 sites per tour', 'White-label mode', 'Team members', 'API access', 'Dedicated support'],
    monthlyKey: 'enterprise_monthly',
    annualKey: 'enterprise_annual',
  },
];

const eventPlan = {
  name: 'Event',
  price: 199,
  duration: '30 days',
  description: 'Perfect for festivals, markets & temporary events',
  features: [
    '1 tour',
    '10 sites',
    '5 media per site',
    'Stamp card',
    'GPS navigation',
    'Offline support',
    'Full access — no recurring fees',
  ],
};

interface PricingSectionProps {
  pricingSubheadline: string;
}

export function PricingSection({ pricingSubheadline }: PricingSectionProps) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-muted-foreground">{pricingSubheadline}</p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-sm font-medium ${billing === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                billing === 'annual' ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  billing === 'annual' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billing === 'annual' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
            <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </div>
        </div>

        {/* Subscription tiers */}
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          {tiers.map((tier) => {
            const price = billing === 'monthly' ? tier.monthly : tier.annual;
            return (
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
                    <span className="text-3xl font-bold">${price}</span>
                    <span className="text-muted-foreground">/mo</span>
                    {billing === 'annual' && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        billed ${tier.annualTotal.toLocaleString()}/yr
                      </p>
                    )}
                    {billing === 'monthly' && (
                      <p className="text-xs text-primary mt-0.5">
                        Save ${(tier.monthly - tier.annual) * 12}/yr with annual
                      </p>
                    )}
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
                  <CheckoutButton
                    priceKey={billing === 'monthly' ? tier.monthlyKey : tier.annualKey}
                    label="Start Free 7-Day Trial"
                    className="w-full mt-6"
                    variant={tier.popular ? 'default' : 'outline'}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Event plan */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="relative rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-bold text-lg">{eventPlan.name} Access</span>
                  <span className="text-xs font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    One-time
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mb-3">{eventPlan.description}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {eventPlan.features.map((f) => (
                    <span key={f} className="flex items-center gap-1.5 text-sm">
                      <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-3 flex-shrink-0">
                <div className="text-center md:text-right">
                  <span className="text-3xl font-bold">${eventPlan.price}</span>
                  <p className="text-sm text-muted-foreground">flat · {eventPlan.duration} access</p>
                </div>
                <CheckoutButton
                  priceKey="event_access"
                  label="Get Event Access"
                  className="w-full md:w-auto"
                />
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 max-w-2xl mx-auto">
          Each subscription is licensed to a single organization for its own use only. Subscriptions may not be shared across multiple unrelated organizations or used to create and manage tours on behalf of third parties without a separate license for each. See our{' '}
          <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link> for full details.
        </p>
      </div>
    </section>
  );
}
