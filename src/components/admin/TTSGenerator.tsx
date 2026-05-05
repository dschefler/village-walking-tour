'use client';

import { useState, useRef } from 'react';
import { Loader2, Wand2, Check, X, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

// To find Arabella's voice ID: log in to elevenlabs.io → Voices → your voice library → click Arabella → copy the Voice ID
const JENNA_VOICE_ID = 'Z3R5wn05IrDiVCyEkUrK';

const JENNA_VOICE = { id: JENNA_VOICE_ID, name: 'Arabella', description: 'Warm and articulate female' };

interface TTSGeneratorProps {
  text: string;
  onGenerated: (audioUrl: string) => void;
  orgId?: string;
  className?: string;
}

export function TTSGenerator({ text, onGenerated, orgId, className = '' }: TTSGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preview state for Arabella sample
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [playingPreview, setPlayingPreview] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setPlayingPreview(false);
  };

  const handlePreview = async () => {
    if (playingPreview) {
      stopPreview();
      return;
    }
    stopPreview();

    setLoadingPreview(true);
    try {
      const res = await fetch(`/api/tts/preview/${JENNA_VOICE.id}`);
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Preview failed');

      const audio = new Audio(data.url);
      audioRef.current = audio;
      setPlayingPreview(true);
      audio.play().catch(() => {});
      audio.onended = () => setPlayingPreview(false);
      audio.onerror = () => setPlayingPreview(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview failed');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleGenerate = async () => {
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
        body: JSON.stringify({ text, voice_id: JENNA_VOICE.id, org_id: orgId }),
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
      {/* Voice indicator */}
      <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/5 px-3 py-2">
        <div>
          <p className="font-medium text-sm">{JENNA_VOICE.name}</p>
          <p className="text-xs text-muted-foreground">{JENNA_VOICE.description}</p>
        </div>
        <button
          type="button"
          onClick={handlePreview}
          disabled={loadingPreview}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
            playingPreview
              ? 'bg-primary/10 text-primary border-primary/20'
              : 'bg-muted/50 hover:bg-muted text-muted-foreground border-border'
          }`}
        >
          {loadingPreview ? (
            <><Loader2 className="w-3 h-3 animate-spin" /> Loading…</>
          ) : playingPreview ? (
            <><Square className="w-3 h-3 fill-current" /> Stop</>
          ) : (
            <><Play className="w-3 h-3 fill-current" /> Hear sample</>
          )}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        &ldquo;Hear sample&rdquo; is free. Only &ldquo;Generate Narration&rdquo; uses a monthly credit.
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
        disabled={generating || !text.trim()}
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
