import Stripe from 'stripe';

let stripe: Stripe | null = null;

export function getStripeServer(): Stripe | null {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      console.warn('Stripe secret key not configured');
      return null;
    }

    stripe = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }

  return stripe;
}

export async function createPaymentIntent(
  amountCents: number,
  currency: string = 'usd',
  metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent | null> {
  const stripeInstance = getStripeServer();

  if (!stripeInstance) {
    throw new Error('Stripe is not configured');
  }

  const paymentIntent = await stripeInstance.paymentIntents.create({
    amount: amountCents,
    currency: currency.toLowerCase(),
    metadata: {
      ...metadata,
      source: 'village-walking-tour',
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
}

export async function retrievePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent | null> {
  const stripeInstance = getStripeServer();

  if (!stripeInstance) {
    throw new Error('Stripe is not configured');
  }

  return stripeInstance.paymentIntents.retrieve(paymentIntentId);
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const stripeInstance = getStripeServer();

  if (!stripeInstance) {
    throw new Error('Stripe is not configured');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('Stripe webhook secret not configured');
  }

  return stripeInstance.webhooks.constructEvent(payload, signature, webhookSecret);
}
