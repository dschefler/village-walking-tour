import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify super-admin role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || !['admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // Per-org TTS usage this month
  const { data: usageRows } = await supabase
    .from('tts_usage')
    .select('org_id, organizations(name, slug, subscription_tier)')
    .gte('created_at', monthStart.toISOString());

  // Aggregate by org
  const byOrg: Record<string, { name: string; slug: string; tier: string; count: number }> = {};
  for (const row of usageRows ?? []) {
    const org = row.organizations as any;
    if (!byOrg[row.org_id]) {
      byOrg[row.org_id] = {
        name: org?.name ?? row.org_id,
        slug: org?.slug ?? '',
        tier: org?.subscription_tier ?? 'unknown',
        count: 0,
      };
    }
    byOrg[row.org_id].count++;
  }

  const tenantUsage = Object.values(byOrg).sort((a, b) => b.count - a.count);
  const totalNarrations = tenantUsage.reduce((sum, t) => sum + t.count, 0);

  // Fetch ElevenLabs account quota
  let elevenLabs: { used: number; limit: number; resetDate: string | null } | null = null;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch('https://api.elevenlabs.io/v1/user', {
        headers: { 'xi-api-key': apiKey },
        next: { revalidate: 300 }, // cache 5 min
      });
      if (res.ok) {
        const data = await res.json();
        const sub = data.subscription;
        elevenLabs = {
          used: sub.character_count ?? 0,
          limit: sub.character_limit ?? 0,
          resetDate: sub.next_character_count_reset_unix
            ? new Date(sub.next_character_count_reset_unix * 1000).toISOString()
            : null,
        };
      }
    } catch {
      // ElevenLabs API unreachable — skip
    }
  }

  return NextResponse.json({ elevenLabs, tenantUsage, totalNarrations });
}
