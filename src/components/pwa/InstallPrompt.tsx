'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
}

function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone);
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) {
      setIsInstalled(true);
      return;
    }

    // Check dismissal
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // iOS — show custom instructions
    if (isIOS()) {
      setShowIOSInstructions(true);
      setIsVisible(true);
      return;
    }

    // Android/Chrome — use beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled || !isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80',
        'bg-card border rounded-lg shadow-lg p-4 z-50',
        'animate-in slide-in-from-bottom-4 duration-300'
      )}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          {showIOSInstructions ? (
            <Share className="w-5 h-5 text-primary" />
          ) : (
            <Download className="w-5 h-5 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Install App</h3>
          {showIOSInstructions ? (
            <div className="text-sm text-muted-foreground mt-1 space-y-2">
              <p>To install this app on your iPhone:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  Tap the <strong>Share</strong> button
                  <Share className="w-3.5 h-3.5 inline mx-1 -mt-0.5" />
                  at the bottom of Safari
                </li>
                <li>Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong></li>
                <li>Tap <strong>&ldquo;Add&rdquo;</strong></li>
              </ol>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mt-1">
                Install this app for offline access and a better experience.
              </p>
              <Button size="sm" className="mt-3" onClick={handleInstall}>
                Install
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
