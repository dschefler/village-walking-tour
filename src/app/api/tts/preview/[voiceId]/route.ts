import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Short fixed text used for all voice previews — same for every voice so users can compare apples to apples
const PREVIEW_TEXT =
  "Welcome, and thanks for joining us on this walking tour. I'll be your guide today as we explore the historic sites of the village.";

export async function GET(
  _request: NextRequest,
  { params }: { params: { voiceId: string } }
) {
  const { voiceId } = params;

  // Basic validation — only allow our curated voice IDs
  const ALLOWED_VOICE_IDS = [
    '21m00Tcm4TlvDq8ikWAM',
    'ErXwobaYiN019PkySvjV',
    'pNInz6obpgDQGcFmaJgB',
    'MF3mGyEYCl7XYWbV9V6O',
    'TxGEqnHWrfWFTfGW9XjX',
    'VR6AewLTigWG4xSOukaG',
  ];
  if (!ALLOWED_VOICE_IDS.includes(voiceId)) {
    return NextResponse.json({ error: 'Invalid voice ID' }, { status: 400 });
  }

  const supabase = createClient();
  const storagePath = `tts/previews/${voiceId}.mp3`;

  // Check if a cached preview already exists in Supabase storage
  const { data: urlData } = supabase.storage.from('tour-media').getPublicUrl(storagePath);
  try {
    const check = await fetch(urlData.publicUrl, { method: 'HEAD', cache: 'no-store' });
    if (check.ok) {
      return NextResponse.json({ url: urlData.publicUrl });
    }
  } catch {
    // Fall through to generation
  }

  // Generate the preview audio via ElevenLabs
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'TTS service not configured' }, { status: 503 });
  }

  const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: PREVIEW_TEXT,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!ttsRes.ok) {
    return NextResponse.json({ error: 'Preview generation failed' }, { status: 502 });
  }

  const audioBuffer = await ttsRes.arrayBuffer();

  // Cache in Supabase storage — overwrite if something is already there
  const { error: uploadError } = await supabase.storage
    .from('tour-media')
    .upload(storagePath, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: freshUrl } = supabase.storage.from('tour-media').getPublicUrl(storagePath);
  return NextResponse.json({ url: freshUrl.publicUrl });
}
