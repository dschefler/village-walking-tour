'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, MapPin, Route, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/stores/notification-store';

interface TourCompletePromptProps {
  onDismiss?: () => void;
  autoHideMs?: number;
}

export function TourCompletePrompt({
  onDismiss,
  autoHideMs = 30000,
}: TourCompletePromptProps) {
  const { showTourCompletePrompt, completedSiteName, dismissTourComplete } = useNotificationStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (showTourCompletePrompt) {
      // Small delay to let the arrival notification show first
      const showTimer = setTimeout(() => {
        setVisible(true);
      }, 3000);
      return () => clearTimeout(showTimer);
    }
  }, [showTourCompletePrompt]);

  useEffect(() => {
    if (visible && autoHideMs > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideMs);
      return () => clearTimeout(timer);
    }
  }, [visible, autoHideMs]);

  const handleDismiss = () => {
    setVisible(false);
    dismissTourComplete();
    onDismiss?.();
  };

  if (!visible || !showTourCompletePrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-gradient-to-r from-[#A40000] to-[#014487] border rounded-lg shadow-xl p-5 max-w-md mx-auto text-white">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-white/20 rounded-full">
            <PartyPopper className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-lg">You&apos;ve Arrived!</h4>
            {completedSiteName && (
              <p className="text-sm text-white/90 mt-1">
                Welcome to {completedSiteName}
              </p>
            )}
            <p className="text-sm text-white/80 mt-2">
              Would you like to explore more historical sites?
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-8 w-8 text-white hover:bg-white/20"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            asChild
            size="sm"
            className="flex-1 bg-white text-[#A40000] hover:bg-white/90"
          >
            <Link href="/historic-sites">
              <MapPin className="w-4 h-4 mr-2" />
              Browse Sites
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="flex-1 border-white text-white hover:bg-white/20"
          >
            <Link href="/create-your-tour">
              <Route className="w-4 h-4 mr-2" />
              New Tour
            </Link>
          </Button>
        </div>
        <button
          onClick={handleDismiss}
          className="mt-3 text-xs text-white/60 hover:text-white/80 w-full text-center"
        >
          No thanks, I&apos;m done for today
        </button>
      </div>
    </div>
  );
}

export function TourCompletePromptContainer() {
  const { showTourCompletePrompt } = useNotificationStore();

  if (!showTourCompletePrompt) return null;

  return <TourCompletePrompt />;
}
