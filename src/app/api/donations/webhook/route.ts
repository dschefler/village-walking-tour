import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { constructWebhookEvent, retrievePaymentIntent } from '@/lib/stripe/server';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = headers();
    const contentType = headersList.get('content-type') || '';

    // Handle PayPal webhook (JSON)
    if (contentType.includes('application/json') && !headersList.get('stripe-signature')) {
      return handlePayPalWebhook(body);
    }

    // Handle Stripe webhook
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    return handleStripeWebhook(body, signature);
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleStripeWebhook(body: string, signature: string) {
  const supabase = createClient();

  try {
    const event = await constructWebhookEvent(body, signature);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;

        await supabase.from('donations').insert({
          amount_cents: paymentIntent.amount,
          currency: paymentIntent.currency.toUpperCase(),
          payment_provider: 'stripe',
          payment_intent_id: paymentIntent.id,
          payment_status: 'succeeded',
          donor_email: paymentIntent.receipt_email || null,
          metadata: paymentIntent.metadata || {},
        });

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;

        // Check if we already have a record for this payment intent
        const { data: existing } = await supabase
          .from('donations')
          .select('id')
          .eq('payment_intent_id', paymentIntent.id)
          .single();

        if (existing) {
          await supabase
            .from('donations')
            .update({ payment_status: 'failed' })
            .eq('payment_intent_id', paymentIntent.id);
        } else {
          await supabase.from('donations').insert({
            amount_cents: paymentIntent.amount,
            currency: paymentIntent.currency.toUpperCase(),
            payment_provider: 'stripe',
            payment_intent_id: paymentIntent.id,
            payment_status: 'failed',
            metadata: paymentIntent.metadata || {},
          });
        }

        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }
}

async function handlePayPalWebhook(body: string) {
  const supabase = createClient();

  try {
    const data = JSON.parse(body);

    // This is called from the frontend after PayPal capture
    if (data.provider === 'paypal' && data.orderId) {
      await supabase.from('donations').insert({
        amount_cents: data.amount,
        currency: data.currency || 'GBP',
        payment_provider: 'paypal',
        payment_intent_id: data.orderId,
        payment_status: 'succeeded',
        donor_email: data.payerEmail || null,
        donor_name: data.payerName || null,
        metadata: {},
      });

      return NextResponse.json({ received: true });
    }

    return NextResponse.json(
      { error: 'Invalid PayPal webhook data' },
      { status: 400 }
    );
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json(
      { error: 'PayPal webhook processing failed' },
      { status: 500 }
    );
  }
}
