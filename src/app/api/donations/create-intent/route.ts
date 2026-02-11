import { NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/stripe/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency = 'usd', metadata } = body;

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount < 100) {
      return NextResponse.json(
        { error: 'Invalid amount. Minimum donation is $1.00' },
        { status: 400 }
      );
    }

    // Cap at reasonable maximum ($10,000)
    if (amount > 1000000) {
      return NextResponse.json(
        { error: 'Amount exceeds maximum allowed' },
        { status: 400 }
      );
    }

    const paymentIntent = await createPaymentIntent(amount, currency, metadata);

    if (!paymentIntent) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
