'use client';

import { useEffect, useState, useRef } from 'react';
import { Lightbulb, Volume2, Square } from 'lucide-react';

interface DidYouKnowPopupProps {
  fact: string;
  audioUrl?: string | null;
  onDismiss: () => void;
}

const TEXT_ONLY_DISMISS_MS = 6000;
const AUDIO_DISMISS_MS = 20000;

export function DidYouKnowPopup({ fact, audioUrl, onDismiss }: DidYouKnowPopupProps) {
  const dismissMs = audioUrl ? AUDIO_DISMISS_MS : TEXT_ONLY_DISMISS_MS;
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-play audio on mount
  useEffect(() => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setIsPlaying(true);
    audio.play().catch(() => setIsPlaying(false));
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  // Auto-dismiss timer
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / dismissMs, 1);
      setProgress(pct);
      if (pct >= 1) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);
    return () => clearInterval(interval);
  }, [onDismiss, dismissMs]);

  const handleToggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Dimmed backdrop */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Card — tappable */}
      <div
        className="relative pointer-events-auto cursor-pointer max-w-sm mx-4 animate-fact-pop"
        onClick={onDismiss}
      >
        <div className="bg-background rounded-2xl shadow-xl p-6 text-center">
          {/* Icon */}
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-amber-500" />
          </div>

          {/* Header */}
          <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-2">
            Did You Know?
          </h3>

          {/* Fact */}
          <p className="text-sm text-foreground leading-relaxed">{fact}</p>

          {/* Audio button — stops propagation so tap doesn't dismiss */}
          {audioUrl && (
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleAudio(); }}
              className="mt-3 flex items-center gap-1.5 mx-auto text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
            >
              {isPlaying ? (
                <><Square className="w-3 h-3 fill-current" /> Stop audio</>
              ) : (
                <><Volume2 className="w-3 h-3" /> Play audio</>
              )}
            </button>
          )}

          {/* Tap hint */}
          <p className="mt-3 text-xs text-muted-foreground">Tap to dismiss</p>

          {/* Progress bar */}
          <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-none rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
