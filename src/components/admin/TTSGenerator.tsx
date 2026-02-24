'use client';

import { useState, useRef } from 'react';
import { Loader2, Wand2, Check, X, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Calm, professional female' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Warm, engaging male' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Clear, authoritative male' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Young, friendly female' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', description: 'Young, energetic male' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', description: 'Deep, storytelling male' },
];

interface TTSGeneratorProps {
  text: string;
  onGenerated: (audioUrl: string) => void;
  orgId?: string;
  defaultVoiceId?: string;
  className?: string;
}

export function TTSGenerator({ text, onGenerated, orgId, defaultVoiceId, className = '' }: TTSGeneratorProps) {
  const [selectedVoice, setSelectedVoice] = useState<string | null>(
    defaultVoiceId && VOICES.find((v) => v.id === defaultVoiceId) ? defaultVoiceId : null
  );
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preview state — keyed by voice id
  const [loadingPreview, setLoadingPreview] = useState<string | null>(null); // voice id being fetched
  const [playingPreview, setPlayingPreview] = useState<string | null>(null); // voice id playing
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setPlayingPreview(null);
  };

  const handlePreview = async (voiceId: string) => {
    // Stop if already playing this voice
    if (playingPreview === voiceId) {
      stopPreview();
      return;
    }
    stopPreview();

    setLoadingPreview(voiceId);
    try {
      const res = await fetch(`/api/tts/preview/${voiceId}`);
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Preview failed');

      const audio = new Audio(data.url);
      audioRef.current = audio;
      setPlayingPreview(voiceId);
      audio.play().catch(() => {});
      audio.onended = () => setPlayingPreview(null);
      audio.onerror = () => setPlayingPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview failed');
    } finally {
      setLoadingPreview(null);
    }
  };

  const handleSelectVoice = (id: string) => {
    stopPreview();
    setSelectedVoice((prev) => (prev === id ? prev : id));
    setGeneratedUrl(null);
  };

  const handleGenerate = async () => {
    if (!selectedVoice) {
      setError('Select a voice above first.');
      return;
    }
    if (!text.trim()) {
      setError('Add a description above — it will be read aloud as the narration.');
      return;
    }
    stopPreview();
    setGenerating(true);
    setError(null);
    setGeneratedUrl(null);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice_id: selectedVoice, org_id: orgId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setGeneratedUrl(data.audio_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Voice picker */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {VOICES.map((voice) => {
          const isSelected = selectedVoice === voice.id;
          const isPreviewing = playingPreview === voice.id;
          const isLoading = loadingPreview === voice.id;
          return (
            <div
              key={voice.id}
              className={`rounded-lg border-2 overflow-hidden transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              {/* Voice name — clicking selects it */}
              <button
                type="button"
                onClick={() => handleSelectVoice(voice.id)}
                className="w-full text-left p-2.5"
              >
                <p className="font-medium text-sm">{voice.name}</p>
                <p className="text-xs text-muted-foreground">{voice.description}</p>
              </button>

              {/* Hear sample button — always visible */}
              <button
                type="button"
                onClick={() => handlePreview(voice.id)}
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border-t transition-colors ${
                  isPreviewing
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground border-border'
                }`}
              >
                {isLoading ? (
                  <><Loader2 className="w-3 h-3 animate-spin" /> Loading…</>
                ) : isPreviewing ? (
                  <><Square className="w-3 h-3 fill-current" /> Stop</>
                ) : (
                  <><Play className="w-3 h-3 fill-current" /> Hear sample</>
                )}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {selectedVoice
          ? <>&ldquo;Hear sample&rdquo; is free. Only &ldquo;Generate Narration&rdquo; uses a monthly credit.</>
          : <>Click a voice to select it, or use &ldquo;Hear sample&rdquo; to preview before choosing.</>
        }
      </p>

      {/* Text preview */}
      {text.trim() ? (
        <p className="text-xs text-muted-foreground bg-muted rounded-md p-2.5 line-clamp-3 italic">
          &ldquo;{text.trim()}&rdquo;
        </p>
      ) : (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2.5">
          Add a description first — the narration is generated from that text.
        </p>
      )}

      {/* Generate button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGenerate}
        disabled={generating || !text.trim() || !selectedVoice}
        className="w-full gap-2"
      >
        {generating ? (
          <><Loader2 className="w-4 h-4 animate-spin" />Generating narration…</>
        ) : (
          <><Wand2 className="w-4 h-4" />Generate Narration</>
        )}
      </Button>

      {/* Generated audio + confirm */}
      {generatedUrl && (
        <div className="space-y-2 p-3 bg-muted/50 rounded-lg border">
          <p className="text-xs font-medium text-muted-foreground">Preview generated narration:</p>
          <audio controls className="w-full h-10" src={generatedUrl} />
          <div className="flex gap-2">
            <Button type="button" className="flex-1 gap-2" onClick={() => onGenerated(generatedUrl)}>
              <Check className="w-4 h-4" />
              Use this Audio
            </Button>
            <Button type="button" variant="outline" size="icon" onClick={() => setGeneratedUrl(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md p-2.5">{error}</p>
      )}
    </div>
  );
}
