import Stripe from 'stripe';

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-02-25.clover',
    httpClient: Stripe.createFetchHttpClient(),
  });
}

// Live mode price IDs, verified directly against the Stripe account on
// 2026-10-13 (read-only restricted key, listing active prices). Starter,
// Pro monthly, Enterprise monthly, Essential Build, and Event Access were
// already correct live prices — only the annual prices and the
// Professional/Enterprise build prices changed this round.
export const PRICE_IDS = {
  starter_monthly:      'price_1T7jyqGfgrM0r4g1YAAIZyqp', // $99/mo
  starter_annual:       'price_1T7jyqGfgrM0r4g1KcfRsA79', // $948/yr
  pro_monthly:          'price_1T7jyrGfgrM0r4g17HzHFsBV', // $179/mo
  pro_annual:           'price_1UQ4BdGfgrM0r4g1Ngg3g3X2', // $2,000/yr
  enterprise_monthly:   'price_1T7jytGfgrM0r4g1SiflSxB1', // $349/mo
  enterprise_annual:    'price_1UQ4N0GfgrM0r4g1eq6XVHOU', // $4,000/yr
  essential_build:      'price_1T7jysGfgrM0r4g1RRTn9Cwx', // $799 one-time
  professional_build:   'price_1UQ4nAGfgrM0r4g1zDK7A8sT', // $4,000 one-time
  enterprise_build:     'price_1UQ4nwGfgrM0r4g1cf43VuUU', // $5,500 one-time
  event_access:         'price_1T7jytGfgrM0r4g1MN0evVyQ', // $199 one-time
} as const;

export type PriceKey = keyof typeof PRICE_IDS;

export const SUBSCRIPTION_PRICE_KEYS: PriceKey[] = [
  'starter_monthly', 'starter_annual',
  'pro_monthly', 'pro_annual',
  'enterprise_monthly', 'enterprise_annual',
];

export function isSubscriptionPrice(key: PriceKey): boolean {
  return SUBSCRIPTION_PRICE_KEYS.includes(key);
}
