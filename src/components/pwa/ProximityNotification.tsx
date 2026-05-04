'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, MapPin, Play, Pause, Square, Loader2, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/stores/notification-store';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import type { ProximityAlert } from '@/types';

interface ProximityNotificationProps {
  alert: ProximityAlert;
  onDismiss?: () => void;
  nextStop?: { name: string; distanceMeters: number };
}

function formatFt(meters: number): string {
  const feet = meters * 3.28084;
  if (feet < 1000) return `${Math.round(feet)} ft`;
  return `${(feet / 5280).toFixed(1)} mi`;
}

export function ProximityNotification({
  alert,
  onDismiss,
  nextStop,
}: ProximityNotificationProps) {
  const { dismissAlert } = useNotificationStore();
  const [visible, setVisible] = useState(true);

  const { isPlaying, currentSiteId, progress, duration, isLoading, progressPercent, load, toggle, stop } =
    useAudioPlayer();

  const hasAudio = !!alert.audioUrl;
  const isCurrentSite = currentSiteId === alert.siteId;

  // Pre-load audio on mount so tap-to-play is instant
  useEffect(() => {
    if (hasAudio && alert.audioUrl) {
      load(alert.audioUrl, alert.siteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDismiss = () => {
    if (isCurrentSite && isPlaying) stop();
    dismissAlert(alert.siteId);
    setVisible(false);
    onDismiss?.();
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md mx-auto border border-gray-100">

        {/* Site photo */}
        {alert.imageUrl && (
          <div className="relative w-full h-40">
            <Image
              src={alert.imageUrl}
              alt={alert.siteName}
              fill
              className="object-cover"
              sizes="(max-width: 448px) 100vw, 448px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {/* Close button over photo */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 rounded-full p-1.5 text-white"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Site name over photo */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
              <div className="flex items-center gap-1.5 mb-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#A40000]" />
                <span className="text-xs text-white/80 font-medium uppercase tracking-wide">You&apos;ve Arrived</span>
              </div>
              <h4 className="font-bold text-white text-base leading-snug">{alert.siteName}</h4>
            </div>
          </div>
        )}

        {/* Header (no photo fallback) */}
        {!alert.imageUrl && (
          <div className="flex items-start gap-3 px-4 pt-4 pb-2">
            <div className="flex-shrink-0 p-2 bg-[#A40000]/10 rounded-full">
              <MapPin className="w-5 h-5 text-[#A40000]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#A40000] font-semibold uppercase tracking-wide">You&apos;ve Arrived</p>
              <h4 className="font-bold text-base leading-snug">{alert.siteName}</h4>
            </div>
            <button onClick={handleDismiss} className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="px-4 pb-4 space-y-3 pt-3">
          {/* Description */}
          {alert.transcript && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {alert.transcript}
            </p>
          )}

          {/* Audio player */}
          {hasAudio && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <button
                onClick={toggle}
                disabled={isLoading}
                className="flex-shrink-0 w-12 h-12 rounded-full bg-[#A40000] text-white flex items-center justify-center shadow disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> :
                  isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  {isLoading ? 'Loading…' : isPlaying ? 'Playing audio tour' : 'Tap to hear audio'}
                </p>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#A40000] transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
                {duration > 0 && (
                  <div className="flex justify-between mt-0.5 text-xs text-gray-400">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                )}
              </div>
              {(isPlaying || isCurrentSite) && (
                <button onClick={() => stop()} className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
                  <Square className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button asChild variant="outline" size="sm" className="flex-1 border-gray-200">
              <Link href={`/location/${alert.siteId}`}>
                <BookOpen className="w-4 h-4 mr-1.5" />
                Full Details
              </Link>
            </Button>
            {nextStop ? (
              <button
                onClick={handleDismiss}
                className="flex-1 flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-black text-white rounded-lg px-3 py-2 text-sm font-semibold"
              >
                Next Stop
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <Button size="sm" className="flex-1 bg-[#A40000] hover:bg-[#8a0000] text-white" onClick={handleDismiss}>
                Continue
              </Button>
            )}
          </div>

          {/* Next stop distance label */}
          {nextStop && (
            <p className="text-xs text-center text-gray-400">{nextStop.name} · {formatFt(nextStop.distanceMeters)} away</p>
          )}
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

  // Hide arrival card when tour complete prompt fires (with delay so user sees site info first)
  useEffect(() => {
    if (!showTourCompletePrompt) return;
    const timer = setTimeout(() => setCurrentAlert(null), 8000);
    return () => clearTimeout(timer);
  }, [showTourCompletePrompt]);

  if (!currentAlert) return null;

  return (
    <ProximityNotification
      alert={currentAlert}
      onDismiss={() => setCurrentAlert(null)}
    />
  );
}
