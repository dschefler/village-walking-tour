import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ARABELLA_VOICE_ID = 'Z3R5wn05IrDiVCyEkUrK';

// GET: return all sites for a tour (id, name, description)
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tourId = new URL(request.url).searchParams.get('tourId');
  if (!tourId) return NextResponse.json({ error: 'tourId required' }, { status: 400 });

  const { data, error } = await supabase
    .from('sites')
    .select('id, name, description, organization_id')
    .eq('tour_id', tourId)
    .order('display_order');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST: generate audio for a single site
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'ELEVENLABS_API_KEY not configured' }, { status: 503 });

  const { siteId, text, orgId } = await request.json();
  if (!siteId || !text?.trim()) return NextResponse.json({ error: 'siteId and text required' }, { status: 400 });

  const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ARABELLA_VOICE_ID}`, {
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
  const filename = `tts/${orgId ?? user.id}/${siteId}-${Date.now()}.mp3`;

  const { error: uploadError } = await supabase.storage
    .from('tour-media')
    .upload(filename, audioBuffer, { contentType: 'audio/mpeg', upsert: true });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: urlData } = supabase.storage.from('tour-media').getPublicUrl(filename);

  const { error: updateError } = await supabase
    .from('sites')
    .update({ audio_url: urlData.publicUrl })
    .eq('id', siteId);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ audio_url: urlData.publicUrl });
}
