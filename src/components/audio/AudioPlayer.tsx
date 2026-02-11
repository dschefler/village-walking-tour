'use client';

import { useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  audioUrl: string;
  siteId: string;
  siteName?: string;
  className?: string;
  autoPlay?: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function AudioPlayer({
  audioUrl,
  siteId,
  siteName,
  className,
  autoPlay = false,
}: AudioPlayerProps) {
  const {
    isPlaying,
    currentSiteId,
    progress,
    duration,
    isLoading,
    error,
    progressPercent,
    load,
    play,
    toggle,
    seekPercent,
  } = useAudioPlayer();

  // Load audio when component mounts or URL changes
  useEffect(() => {
    if (currentSiteId !== siteId) {
      load(audioUrl, siteId);
    }
  }, [audioUrl, siteId, currentSiteId, load]);

  // Auto-play if requested
  useEffect(() => {
    if (autoPlay && !isLoading && currentSiteId === siteId && !isPlaying) {
      play();
    }
  }, [autoPlay, isLoading, currentSiteId, siteId, isPlaying, play]);

  const handleSeek = (value: number[]) => {
    seekPercent(value[0]);
  };

  const skipBackward = () => {
    seekPercent(Math.max(0, progressPercent - 10));
  };

  const skipForward = () => {
    seekPercent(Math.min(100, progressPercent + 10));
  };

  if (error) {
    return (
      <div className={cn('p-4 bg-destructive/10 rounded-lg text-destructive text-sm', className)}>
        {error}
      </div>
    );
  }

  return (
    <div className={cn('bg-card border rounded-lg p-4', className)}>
      {siteName && (
        <div className="mb-3 text-sm font-medium text-muted-foreground">
          Now Playing: {siteName}
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-4">
        <Slider
          value={[progressPercent]}
          max={100}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full"
          disabled={isLoading}
        />
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={skipBackward}
          disabled={isLoading}
          aria-label="Skip backward 10 seconds"
        >
          <SkipBack className="w-5 h-5" />
        </Button>

        <Button
          variant="default"
          size="icon"
          className="w-12 h-12"
          onClick={toggle}
          disabled={isLoading}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={skipForward}
          disabled={isLoading}
          aria-label="Skip forward 10 seconds"
        >
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

// Mini player for persistent display
export function MiniAudioPlayer({ className }: { className?: string }) {
  const { isPlaying, currentSiteId, progressPercent, isLoading, toggle } = useAudioPlayer();

  if (!currentSiteId) return null;

  return (
    <div className={cn('flex items-center gap-3 p-2 bg-card border rounded-lg', className)}>
      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8"
        onClick={toggle}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>

      <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <Volume2 className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}
