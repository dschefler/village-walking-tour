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
  starter_monthly:      'price_1T7iP7K07doTLFq1bYtHcYTg',
  starter_annual:       'price_1T7idpK07doTLFq1B7H7qVYy',
  pro_monthly:          'price_1T7ifWK07doTLFq1Mnq8qZ9h',
  pro_annual:           'price_1T7ijXK07doTLFq1HhHcDsnI',
  enterprise_monthly:   'price_1T7ilaK07doTLFq1pK1B8eX9',
  enterprise_annual:    'price_1T7imIK07doTLFq1U33pwtzG',
  essential_build:      'price_1T7iq7K07doTLFq1VxF0wRC8',
  professional_build:   'price_1T7iqeK07doTLFq1fDhFYure',
  enterprise_build:     'price_1T7irHK07doTLFq1Rmjinu3v',
  event_access:         'price_1T7irpK07doTLFq1lou5pNfE',
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
