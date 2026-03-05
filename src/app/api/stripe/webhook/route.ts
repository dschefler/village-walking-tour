import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const stripe = getStripe();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const email = session.customer_details?.email;
      const customerId = session.customer as string;
      const mode = session.mode;

      if (email) {
        // Log the checkout — org will be linked when user signs up
        await supabase.from('checkout_sessions').insert({
          stripe_session_id: session.id,
          stripe_customer_id: customerId,
          email,
          mode,
          amount_total: session.amount_total,
          created_at: new Date().toISOString(),
        }).select();

        // If org already exists for this email, update stripe_customer_id
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('contact_email', email)
          .maybeSingle();

        if (org) {
          await supabase
            .from('organizations')
            .update({ stripe_customer_id: customerId })
            .eq('id', org.id);
        }
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const sub = event.data.object;
      const customerId = sub.customer as string;

      const tier = (sub.metadata?.plan || 'starter') as string;
      const status = sub.status;

      await supabase
        .from('organizations')
        .update({
          subscription_status: status,
          subscription_tier: tier,
          trial_ends_at: sub.trial_end
            ? new Date(sub.trial_end * 1000).toISOString()
            : null,
        })
        .eq('stripe_customer_id', customerId);
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const customerId = sub.customer as string;

      await supabase
        .from('organizations')
        .update({ subscription_status: 'canceled' })
        .eq('stripe_customer_id', customerId);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const customerId = invoice.customer as string;

      await supabase
        .from('organizations')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
