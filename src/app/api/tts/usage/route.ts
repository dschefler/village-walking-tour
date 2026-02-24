import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PLAN_LIMITS: Record<string, number> = {
  trial: 5,
  starter: 20,
  pro: 100,
  enterprise: 999999,
};

export async function GET() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Find org
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, organizations(subscription_tier)')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!membership) {
    return NextResponse.json({ used: 0, limit: 20, tier: 'starter' });
  }

  const orgId = membership.organization_id;
  const tier = (membership.organizations as any)?.subscription_tier ?? 'starter';
  const limit = PLAN_LIMITS[tier] ?? 20;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('tts_usage')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .gte('created_at', monthStart.toISOString());

  return NextResponse.json({ used: count ?? 0, limit, tier });
}
