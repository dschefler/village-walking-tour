'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, MapPin, Play, Pause, Square, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/stores/notification-store';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { formatDistance } from '@/lib/utils';
import type { ProximityAlert } from '@/types';

interface ProximityNotificationProps {
  alert: ProximityAlert;
  onDismiss?: () => void;
  autoHideMs?: number;
}

export function ProximityNotification({
  alert,
  onDismiss,
  autoHideMs = 20000,
}: ProximityNotificationProps) {
  const { dismissAlert } = useNotificationStore();
  const [visible, setVisible] = useState(true);

  const {
    isPlaying,
    currentSiteId,
    progress,
    duration,
    isLoading,
    progressPercent,
    load,
    toggle,
    stop,
  } = useAudioPlayer();

  const hasAudio = !!alert.audioUrl;
  const isCurrentSite = currentSiteId === alert.siteId;

  // Pre-load audio immediately on mount so play button is ready
  useEffect(() => {
    if (hasAudio && alert.audioUrl) {
      load(alert.audioUrl, alert.siteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-hide only for sites without audio; never auto-hide while audio is loaded/playing
  useEffect(() => {
    if (hasAudio) return;
    if (autoHideMs > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, autoHideMs);
      return () => clearTimeout(timer);
    }
  }, [hasAudio, autoHideMs, onDismiss]);

  const handleDismiss = () => {
    if (isCurrentSite && isPlaying) {
      stop();
    }
    dismissAlert(alert.siteId);
    setVisible(false);
    onDismiss?.();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-card border rounded-lg shadow-lg p-4 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-primary/10 rounded-full">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">You&apos;ve Arrived!</h4>
            <p className="font-medium text-sm line-clamp-1">{alert.siteName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDistance(alert.distance)} away
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-8 w-8"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Audio Player — shown immediately if audio is available */}
        {hasAudio && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-3">
              {/* Big play/pause button */}
              <button
                onClick={toggle}
                disabled={isLoading}
                className="flex-shrink-0 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-md disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </button>

              {/* Progress bar + time */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {isLoading ? 'Loading audio…' : isPlaying ? 'Playing audio tour' : 'Tap to hear the audio tour'}
                </p>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {duration > 0 && (
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                )}
              </div>

              {/* Stop button */}
              {(isPlaying || isCurrentSite) && (
                <button
                  onClick={() => stop()}
                  className="flex-shrink-0 w-9 h-9 rounded-full bg-destructive/10 text-destructive flex items-center justify-center"
                  title="Stop audio"
                >
                  <Square className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Learn More */}
        <div className="mt-3 pt-3 border-t flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/location/${alert.siteId}`}>
              <BookOpen className="w-4 h-4 mr-1.5" />
              Learn More
            </Link>
          </Button>
          <Button size="sm" className="flex-1" onClick={handleDismiss}>
            Continue Tour
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProximityNotificationContainer() {
  const { recentAlerts, enabled, showTourCompletePrompt } = useNotificationStore();
  const [currentAlert, setCurrentAlert] = useState<ProximityAlert | null>(null);

  useEffect(() => {
    if (enabled && recentAlerts.length > 0) {
      setCurrentAlert(recentAlerts[0]);
    }
  }, [recentAlerts, enabled]);

  // Hide arrival notification when tour complete prompt appears
  useEffect(() => {
    if (showTourCompletePrompt) {
      setCurrentAlert(null);
    }
  }, [showTourCompletePrompt]);

  if (!currentAlert) return null;

  return (
    <ProximityNotification
      alert={currentAlert}
      onDismiss={() => setCurrentAlert(null)}
    />
  );
}
