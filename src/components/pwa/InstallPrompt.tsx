'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';
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

type PromptMode = 'idle' | 'android' | 'ios' | 'desktop' | 'installed';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<PromptMode>('idle');
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (isInStandaloneMode()) {
      setMode('installed');
      return;
    }

    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const daysSince = (Date.now() - parseInt(dismissed, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    if (isIOS()) {
      setMode('ios');
      return;
    }

    // Wait briefly for beforeinstallprompt; fall back to desktop QR card
    const fallbackTimer = setTimeout(() => {
      setMode(prev => prev === 'idle' ? 'desktop' : prev);
    }, 2000);

    const handleBeforeInstallPrompt = (e: Event) => {
      clearTimeout(fallbackTimer);
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setMode('android');
    };

    const handleAppInstalled = () => {
      setMode('installed');
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Generate QR code when desktop mode activates
  useEffect(() => {
    if (mode !== 'desktop') return;
    const url = window.location.origin;
    QRCode.toDataURL(url, { width: 160, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [mode]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setMode('installed');
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setMode('installed'); // hides the prompt
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (mode === 'idle' || mode === 'installed') return null;

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

      {/* Android — native install prompt */}
      {mode === 'android' && (
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Install App</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Install this app for offline access and a better experience.
            </p>
            <Button size="sm" className="mt-3" onClick={handleInstall}>
              Install
            </Button>
          </div>
        </div>
      )}

      {/* iOS — share button instructions */}
      {mode === 'ios' && (
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Share className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Install App</h3>
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
          </div>
        </div>
      )}

      {/* Desktop — QR code to open on phone */}
      {mode === 'desktop' && (
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Best on Mobile</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Scan to open the tour on your phone and install it as an app.
            </p>
            <div className="mt-3 flex justify-center">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR code to open tour on phone" className="rounded" width={120} height={120} />
              ) : (
                <div className="w-[120px] h-[120px] bg-muted rounded animate-pulse" />
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Point your phone camera at this code
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
