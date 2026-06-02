import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://walkingtourbuilder.com';

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Find the org and its Stripe customer ID
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, organizations(stripe_customer_id)')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  const customerId = (membership?.organizations as any)?.stripe_customer_id as string | null;
  if (!customerId) {
    return NextResponse.json(
      { error: 'No active subscription found. Please contact support.' },
      { status: 404 }
    );
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${BASE_URL}/dashboard/settings`,
  });

  return NextResponse.json({ url: session.url });
}
