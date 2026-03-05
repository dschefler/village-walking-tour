import { NextRequest, NextResponse } from 'next/server';
import { getStripe, PRICE_IDS, isSubscriptionPrice, type PriceKey } from '@/lib/stripe';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://walkingtourbuilder.com';

export async function POST(request: NextRequest) {
  const { priceKey, email } = await request.json() as { priceKey: PriceKey; email?: string };

  if (!priceKey || !(priceKey in PRICE_IDS)) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
  }

  const priceId = PRICE_IDS[priceKey];
  const isSub = isSubscriptionPrice(priceKey);
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: isSub ? 'subscription' : 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    ...(isSub && { subscription_data: { trial_period_days: 7 } }),
    ...(email && { customer_email: email }),
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    success_url: `${BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=${isSub ? 'subscription' : 'payment'}`,
    cancel_url: `${BASE_URL}/product#pricing`,
  });

  return NextResponse.json({ url: session.url });
}
