'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, MapPin, Navigation, Volume2, Play, Pause, Square, Loader2, BookOpen } from 'lucide-react';
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
  autoHideMs = 15000,
}: ProximityNotificationProps) {
  const { dismissAlert } = useNotificationStore();
  const [visible, setVisible] = useState(true);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  const {
    isPlaying,
    currentSiteId,
    progress,
    duration,
    isLoading,
    progressPercent,
    load,
    play,
    toggle,
    stop,
  } = useAudioPlayer();

  const hasAudio = !!alert.audioUrl;
  const isCurrentSite = currentSiteId === alert.siteId;

  useEffect(() => {
    // Don't auto-hide if audio is playing
    if (autoHideMs > 0 && !showAudioPlayer) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, autoHideMs);
      return () => clearTimeout(timer);
    }
  }, [autoHideMs, onDismiss, showAudioPlayer]);

  const handleDismiss = () => {
    // Stop audio if playing when dismissing
    if (isCurrentSite && isPlaying) {
      stop();
    }
    dismissAlert(alert.siteId);
    setVisible(false);
    onDismiss?.();
  };

  const handleListenToAudio = () => {
    if (alert.audioUrl) {
      load(alert.audioUrl, alert.siteId);
      setShowAudioPlayer(true);
      // Start playing after a short delay to let it load
      setTimeout(() => play(), 500);
    }
  };

  const handleStopAudio = () => {
    stop();
    setShowAudioPlayer(false);
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
        {/* Dancing stickman celebration GIF */}
        <div className="flex justify-center mb-3">
          <iframe
            src="https://tenor.com/embed/27648124"
            width="120"
            height="170"
            frameBorder="0"
            allowFullScreen
            className="rounded-lg"
          />
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-primary/10 rounded-full">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">You&apos;ve Arrived!</h4>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {alert.siteName}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
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

        {/* Audio Section */}
        {hasAudio && (
          <div className="mt-3 pt-3 border-t space-y-2">
            {/* Listen to Audio Button */}
            {!showAudioPlayer && (
              <Button
                onClick={handleListenToAudio}
                className="w-full bg-[#A40000] hover:bg-[#8a0000] text-white"
                size="sm"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Listen to Audio Tour
              </Button>
            )}

            {/* Audio Player */}
            {showAudioPlayer && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={toggle}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </Button>

                  {/* Progress bar */}
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#A40000] transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>{formatTime(progress)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Stop/Cancel button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-10 w-10"
                    onClick={handleStopAudio}
                    title="Stop audio"
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Tap the red button to stop and close the audio player
                </p>
              </div>
            )}

            {/* Learn More - links to location page */}
            {!showAudioPlayer && (
              <Button
                asChild
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Link href={`/location/${alert.siteId}`}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Learn More About This Site
                </Link>
              </Button>
            )}
          </div>
        )}

        {/* Learn More for sites without audio */}
        {!hasAudio && (
          <div className="mt-3 pt-3 border-t">
            <Button
              asChild
              variant="outline"
              className="w-full"
              size="sm"
            >
              <Link href={`/location/${alert.siteId}`}>
                <BookOpen className="w-4 h-4 mr-2" />
                Learn More About This Site
              </Link>
            </Button>
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/location/${alert.siteId}`}>
              View Location
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${alert.siteName}&travelmode=walking`;
              window.open(url, '_blank');
            }}
          >
            <Navigation className="w-4 h-4" />
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
