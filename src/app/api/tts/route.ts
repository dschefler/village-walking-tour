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

export async function GET() {
  return NextResponse.json(VOICE_OPTIONS);
}

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { text, voice_id } = await request.json();

  if (!text?.trim() || !voice_id) {
    return NextResponse.json({ error: 'text and voice_id are required' }, { status: 400 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'TTS service not configured. Add ELEVENLABS_API_KEY to your environment variables.' },
      { status: 503 }
    );
  }

  // Call ElevenLabs text-to-speech
  const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text.trim(),
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!ttsRes.ok) {
    const errText = await ttsRes.text();
    console.error('ElevenLabs error:', errText);
    return NextResponse.json({ error: 'Audio generation failed. Check your ElevenLabs API key.' }, { status: 502 });
  }

  const audioBuffer = await ttsRes.arrayBuffer();
  const filename = `tts/${user.id}/${Date.now()}.mp3`;

  const { error: uploadError } = await supabase.storage
    .from('tour-media')
    .upload(filename, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from('tour-media').getPublicUrl(filename);

  return NextResponse.json({ audio_url: urlData.publicUrl });
}
