import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ARABELLA_VOICE_ID = 'Z3R5wn05IrDiVCyEkUrK';

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ELEVENLABS_API_KEY not configured' }, { status: 503 });
  }

  const { tourId } = await request.json();
  if (!tourId) {
    return NextResponse.json({ error: 'tourId is required' }, { status: 400 });
  }

  const { data: sites, error: sitesError } = await supabase
    .from('sites')
    .select('id, name, description, organization_id')
    .eq('tour_id', tourId)
    .order('display_order');

  if (sitesError) {
    return NextResponse.json({ error: sitesError.message }, { status: 500 });
  }

  const results = { success: 0, failed: 0, skipped: 0, errors: [] as string[] };

  for (const site of sites ?? []) {
    if (!site.description?.trim()) {
      results.skipped++;
      continue;
    }

    try {
      const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ARABELLA_VOICE_ID}`, {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: site.description.trim(),
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });

      if (!ttsRes.ok) {
        throw new Error(`ElevenLabs error: ${await ttsRes.text()}`);
      }

      const audioBuffer = await ttsRes.arrayBuffer();
      const orgId = site.organization_id ?? user.id;
      const filename = `tts/${orgId}/${site.id}-${Date.now()}.mp3`;

      const { error: uploadError } = await supabase.storage
        .from('tour-media')
        .upload(filename, audioBuffer, { contentType: 'audio/mpeg', upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = supabase.storage.from('tour-media').getPublicUrl(filename);

      const { error: updateError } = await supabase
        .from('sites')
        .update({ audio_url: urlData.publicUrl })
        .eq('id', site.id);

      if (updateError) throw new Error(updateError.message);

      results.success++;
    } catch (err) {
      results.failed++;
      results.errors.push(`${site.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json(results);
}
