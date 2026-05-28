'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Wand2, Check, X, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceOption {
  id: string;
  name: string;
  description: string;
}

interface TTSGeneratorProps {
  text: string;
  onGenerated: (audioUrl: string) => void;
  orgId?: string;
  defaultVoiceId?: string;
  className?: string;
}

export function TTSGenerator({ text, onGenerated, orgId, defaultVoiceId, className = '' }: TTSGeneratorProps) {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(defaultVoiceId || '');
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [loadingPreviewId, setLoadingPreviewId] = useState<string | null>(null);
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('/api/tts')
      .then((r) => r.ok ? r.json() : [])
      .then((data: VoiceOption[]) => {
        setVoices(data);
        if (!selectedVoiceId && data.length > 0) {
          setSelectedVoiceId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setPlayingPreviewId(null);
  };

  const handlePreview = async (voiceId: string) => {
    if (playingPreviewId === voiceId) {
      stopPreview();
      return;
    }
    stopPreview();

    setLoadingPreviewId(voiceId);
    try {
      const res = await fetch(`/api/tts/preview/${voiceId}`);
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Preview failed');

      const audio = new Audio(data.url);
      audioRef.current = audio;
      setPlayingPreviewId(voiceId);
      audio.play().catch(() => {});
      audio.onended = () => setPlayingPreviewId(null);
      audio.onerror = () => setPlayingPreviewId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview failed');
    } finally {
      setLoadingPreviewId(null);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Add a description above — it will be read aloud as the narration.');
      return;
    }
    if (!selectedVoiceId) {
      setError('Select a voice first.');
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
        body: JSON.stringify({ text, voice_id: selectedVoiceId, org_id: orgId }),
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
      {/* Voice selector */}
      {voices.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Choose a voice</p>
          <div className="space-y-1.5">
            {voices.map((voice) => {
              const isSelected = selectedVoiceId === voice.id;
              const isLoadingPreview = loadingPreviewId === voice.id;
              const isPlayingPreview = playingPreviewId === voice.id;
              return (
                <div
                  key={voice.id}
                  onClick={() => setSelectedVoiceId(voice.id)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${
                      isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                    }`} />
                    <div>
                      <p className="text-sm font-medium leading-none">{voice.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{voice.description}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handlePreview(voice.id); }}
                    disabled={isLoadingPreview}
                    className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border transition-colors flex-shrink-0 ${
                      isPlayingPreview
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-muted/50 hover:bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {isLoadingPreview ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isPlayingPreview ? (
                      <><Square className="w-3 h-3 fill-current" /> Stop</>
                    ) : (
                      <><Play className="w-3 h-3 fill-current" /> Sample</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            &ldquo;Sample&rdquo; is free. Only &ldquo;Generate Narration&rdquo; uses a monthly credit.
          </p>
        </div>
      )}

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
        disabled={generating || !text.trim() || !selectedVoiceId}
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
