'use client';

import { useState } from 'react';
import { Loader2, Wand2, Check, X } from 'lucide-react';
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
  className?: string;
}

export function TTSGenerator({ text, onGenerated, className = '' }: TTSGeneratorProps) {
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Add a description above — it will be read aloud as the narration.');
      return;
    }
    setGenerating(true);
    setError(null);
    setPreviewUrl(null);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice_id: selectedVoice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setPreviewUrl(data.audio_url);
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
        {VOICES.map((voice) => (
          <button
            key={voice.id}
            type="button"
            onClick={() => { setSelectedVoice(voice.id); setPreviewUrl(null); }}
            className={`text-left p-2.5 rounded-lg border-2 transition-colors ${
              selectedVoice === voice.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <p className="font-medium text-sm">{voice.name}</p>
            <p className="text-xs text-muted-foreground">{voice.description}</p>
          </button>
        ))}
      </div>

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
          <><Loader2 className="w-4 h-4 animate-spin" />Generating narration...</>
        ) : (
          <><Wand2 className="w-4 h-4" />Generate Narration</>
        )}
      </Button>

      {/* Preview + confirm */}
      {previewUrl && (
        <div className="space-y-2 p-3 bg-muted/50 rounded-lg border">
          <p className="text-xs font-medium text-muted-foreground">Preview:</p>
          <audio controls className="w-full h-10" src={previewUrl} />
          <div className="flex gap-2">
            <Button type="button" className="flex-1 gap-2" onClick={() => onGenerated(previewUrl)}>
              <Check className="w-4 h-4" />
              Use this Audio
            </Button>
            <Button type="button" variant="outline" size="icon" onClick={() => setPreviewUrl(null)}>
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
