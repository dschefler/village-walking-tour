import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRequesterMembership } from '@/lib/auth/membership';

const CHUCK_NEWSWORTHY_VOICE_ID = '2RSrGXhRlTEUFC0nwaNn';
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel — fallback for tenants with no default set

const PLAN_LIMITS: Record<string, number> = {
  starter: 20,
  pro: 100,
  enterprise: 999999,
};

// GET: return all sites for a tour (id, name, description)
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tourId = new URL(request.url).searchParams.get('tourId');
  if (!tourId) return NextResponse.json({ error: 'tourId required' }, { status: 400 });

  // Previously returned any tour's sites (including cross-org, unpublished
  // ones with full description text) to anyone merely logged in. Verify
  // the tour actually belongs to the caller's own org first.
  const membership = await getRequesterMembership(supabase, user.id);
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 });

  const { data, error } = await supabase
    .from('sites')
    .select('id, name, description, organization_id, audio_url')
    .eq('tour_id', tourId)
    .eq('organization_id', membership.organization_id)
    .order('display_order');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST: generate audio for a single site (called in a loop by the admin page)
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'ELEVENLABS_API_KEY not configured' }, { status: 503 });

  const { siteId, text, voiceId: requestedVoiceId } = await request.json();
  if (!siteId || !text?.trim()) return NextResponse.json({ error: 'siteId and text required' }, { status: 400 });

  // Previously trusted a client-supplied `orgId` for billing/quota/voice
  // selection, and updated `sites` by siteId alone — a logged-in user of
  // Org A could pass Org B's siteId with Org A's own orgId, bill the
  // narration to Org A's quota while overwriting Org B's live site audio
  // with attacker-chosen text. Always re-derive the org from the site's
  // own row and require the caller to actually be a member of it.
  const membership = await getRequesterMembership(supabase, user.id);
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 });

  const { data: siteRow, error: siteError } = await supabase
    .from('sites')
    .select('id, organization_id')
    .eq('id', siteId)
    .single();

  if (siteError || !siteRow) {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 });
  }
  if (siteRow.organization_id !== membership.organization_id) {
    return NextResponse.json({ error: 'Not authorized for this site' }, { status: 403 });
  }

  const resolvedOrgId = membership.organization_id;

  const { data: org } = await supabase
    .from('organizations')
    .select('subscription_tier, default_tts_voice, slug')
    .eq('id', resolvedOrgId)
    .single();

  const subscriptionTier = org?.subscription_tier ?? 'starter';
  const orgVoiceId = org?.default_tts_voice ?? null;
  const isSouthampton = org?.slug === 'southampton';

  // Check monthly usage limit
  if (resolvedOrgId) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('tts_usage')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', resolvedOrgId)
      .gte('created_at', monthStart.toISOString());

    const limit = PLAN_LIMITS[subscriptionTier] ?? 20;
    const used = count ?? 0;

    if (used >= limit) {
      return NextResponse.json(
        {
          error: `Monthly narration limit reached (${used}/${limit} used). Upgrade your plan for more.`,
          used,
          limit,
        },
        { status: 429 }
      );
    }
  }

  // Determine which voice to use:
  // 1. Southampton always uses Chuck Newsworthy
  // 2. Otherwise use: caller-provided voiceId → org default → Rachel fallback
  const voiceId = isSouthampton
    ? CHUCK_NEWSWORTHY_VOICE_ID
    : (requestedVoiceId || orgVoiceId || DEFAULT_VOICE_ID);

  const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: text.trim(),
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!ttsRes.ok) {
    const err = await ttsRes.text();
    return NextResponse.json({ error: `ElevenLabs: ${err}` }, { status: 502 });
  }

  const audioBuffer = await ttsRes.arrayBuffer();
  const filename = `tts/${resolvedOrgId ?? user.id}/${siteId}-${Date.now()}.mp3`;

  const { error: uploadError } = await supabase.storage
    .from('tour-media')
    .upload(filename, audioBuffer, { contentType: 'audio/mpeg', upsert: true });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: urlData } = supabase.storage.from('tour-media').getPublicUrl(filename);

  const { error: updateError } = await supabase
    .from('sites')
    .update({ audio_url: urlData.publicUrl })
    .eq('id', siteId)
    .eq('organization_id', resolvedOrgId);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  // Record usage
  if (resolvedOrgId) {
    await supabase.from('tts_usage').insert({ org_id: resolvedOrgId, user_id: user.id });
  }

  return NextResponse.json({ audio_url: urlData.publicUrl });
}
