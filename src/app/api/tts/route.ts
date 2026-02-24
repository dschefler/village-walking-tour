import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const VOICE_OPTIONS = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Calm, professional female' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Warm, engaging male' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Clear, authoritative male' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Young, friendly female' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', description: 'Young, energetic male' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', description: 'Deep, storytelling male' },
];

const PLAN_LIMITS: Record<string, number> = {
  trial: 5,
  starter: 20,
  pro: 100,
  enterprise: 999999,
};

export async function GET() {
  return NextResponse.json(VOICE_OPTIONS);
}

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { text, voice_id, org_id } = await request.json();

  if (!text?.trim() || !voice_id) {
    return NextResponse.json({ error: 'text and voice_id are required' }, { status: 400 });
  }

  // Resolve org — use provided org_id or fall back to first org user belongs to
  let orgId = org_id;
  let subscriptionTier = 'starter';

  if (orgId) {
    // Verify user is a member
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    // Also allow admin/editor via user_profiles
    if (!membership) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (!profile || !['admin', 'editor'].includes(profile.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const { data: org } = await supabase
      .from('organizations')
      .select('subscription_tier')
      .eq('id', orgId)
      .single();

    if (org) subscriptionTier = org.subscription_tier;
  } else {
    // No org_id provided — look up from membership
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id, organizations(subscription_tier)')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (membership) {
      orgId = membership.organization_id;
      subscriptionTier = (membership.organizations as any)?.subscription_tier ?? 'starter';
    }
  }

  // Check monthly usage limit
  if (orgId) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('tts_usage')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
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

  // Check API key
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'TTS service not configured. Add ELEVENLABS_API_KEY to environment variables.' },
      { status: 503 }
    );
  }

  // Generate audio via ElevenLabs
  const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text.trim(),
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!ttsRes.ok) {
    console.error('ElevenLabs error:', await ttsRes.text());
    return NextResponse.json(
      { error: 'Audio generation failed. Check your ElevenLabs API key.' },
      { status: 502 }
    );
  }

  const audioBuffer = await ttsRes.arrayBuffer();
  const filename = `tts/${orgId ?? user.id}/${Date.now()}.mp3`;

  const { error: uploadError } = await supabase.storage
    .from('tour-media')
    .upload(filename, audioBuffer, { contentType: 'audio/mpeg', upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from('tour-media').getPublicUrl(filename);

  // Record usage
  if (orgId) {
    await supabase.from('tts_usage').insert({ org_id: orgId, user_id: user.id });
  }

  return NextResponse.json({ audio_url: urlData.publicUrl });
}
