import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';

const PLAN_LABELS: Record<string, string> = {
  starter_monthly:      'Starter Plan (Monthly)',
  starter_annual:       'Starter Plan (Annual)',
  pro_monthly:          'Pro Plan (Monthly)',
  pro_annual:           'Pro Plan (Annual)',
  enterprise_monthly:   'Enterprise Plan (Monthly)',
  enterprise_annual:    'Enterprise Plan (Annual)',
  essential_build:      'Tour Builder Concierge — Essential Build',
  professional_build:   'Tour Builder Concierge — Professional Build',
  enterprise_build:     'Tour Builder Concierge — Enterprise Build',
};

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL; // verified sender (info@walkingtourbuilder.com)
  if (!apiKey || !from) return;

  try {
    const sgMail = await import('@sendgrid/mail');
    sgMail.default.setApiKey(apiKey);
    await sgMail.default.send({ to, from, subject, html });
  } catch (err) {
    console.error('Email send error:', err);
  }
}

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
      const name = session.customer_details?.name || 'there';
      const customerId = session.customer as string;
      const mode = session.mode;
      const planKey = session.metadata?.plan || '';
      const planLabel = PLAN_LABELS[planKey] || planKey;
      const amountDollars = session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : '';
      const isBuild = planKey.includes('_build');
      const adminEmail = process.env.CONTACT_EMAIL_TO;

      if (email) {
        // Log the checkout
        await supabase.from('checkout_sessions').insert({
          stripe_session_id: session.id,
          stripe_customer_id: customerId,
          email,
          mode,
          amount_total: session.amount_total,
          created_at: new Date().toISOString(),
        });

        // Link stripe_customer_id to org if it already exists
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

        // Email to you (admin notification)
        if (adminEmail) {
          await sendEmail(
            adminEmail,
            `New Walking Tour Builder Purchase — ${planLabel}`,
            `
<h2>New Purchase</h2>
<p><strong>Plan:</strong> ${planLabel}</p>
<p><strong>Customer:</strong> ${name}</p>
<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
${amountDollars ? `<p><strong>Amount:</strong> ${amountDollars}</p>` : ''}
<p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
${isBuild ? '<p><strong>Action needed:</strong> Reach out within 1 business day to kick off the project.</p>' : ''}
            `.trim()
          );
        }

        // Confirmation email to customer
        if (isBuild) {
          await sendEmail(
            email,
            `Your Walking Tour Builder order is confirmed`,
            `
<p>Hi ${name},</p>
<p>Thank you for purchasing the <strong>${planLabel}</strong>. We're excited to build your tour!</p>
<p>Our team will be in touch within <strong>1 business day</strong> to kick things off. In the meantime, go ahead and create your account so we're ready to go:</p>
<p><a href="https://walkingtourbuilder.com/signup" style="background:#3B82F6;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold;">Create Your Account</a></p>
<p>If you have any questions before then, just reply to this email.</p>
<p>Talk soon,<br>The Walking Tour Builder Team</p>
            `.trim()
          );
        } else {
          await sendEmail(
            email,
            `Welcome to Walking Tour Builder — you're all set!`,
            `
<p>Hi ${name},</p>
<p>Welcome to Walking Tour Builder! You're now subscribed to the <strong>${planLabel}</strong>.</p>
<p>Create your account to start building your tour:</p>
<p><a href="https://walkingtourbuilder.com/signup" style="background:#3B82F6;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold;">Set Up Your Tour →</a></p>
<p>Once you're in, the setup wizard will walk you through adding your locations, branding, and going live. It takes about 30 minutes to have a working tour.</p>
<p>If you run into anything, just reply to this email — we're here to help.</p>
<p>Welcome aboard,<br>The Walking Tour Builder Team</p>
            `.trim()
          );
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
