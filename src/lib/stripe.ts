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

// All price IDs — swap these for live mode prices when activating Stripe
export const PRICE_IDS = {
  starter_monthly:      'price_1T7jyqGfgrM0r4g1YAAIZyqp',
  starter_annual:       'price_1T7jyqGfgrM0r4g1KcfRsA79',
  pro_monthly:          'price_1T7jyrGfgrM0r4g17HzHFsBV',
  pro_annual:           'price_1T7jyqGfgrM0r4g1NZhghHPq',
  enterprise_monthly:   'price_1T7jytGfgrM0r4g1SiflSxB1',
  enterprise_annual:    'price_1T7jytGfgrM0r4g1HRSIRUNP',
  essential_build:      'price_1T7jysGfgrM0r4g1RRTn9Cwx',
  professional_build:   'price_1T7jysGfgrM0r4g1gl77VNZu',
  enterprise_build:     'price_1T7jyqGfgrM0r4g1s8dyxccl',
  event_access:         'price_1T7jytGfgrM0r4g1MN0evVyQ',
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
