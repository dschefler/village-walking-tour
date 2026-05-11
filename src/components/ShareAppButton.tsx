'use client';

import { useState, useEffect } from 'react';
import { Share2, Copy, Check, X, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const APP_URL = 'https://southamptonwalkingtour.com';

export function ShareAppButton() {
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    QRCode.toDataURL(APP_URL, {
      width: 220,
      margin: 2,
      color: { dark: '#A40000', light: '#ffffff' },
    }).then(setQrDataUrl).catch(() => {});
  }, [open]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(APP_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* unavailable */ }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({
        title: 'Southampton Village Historical Walking Tours',
        text: 'Free self-guided GPS walking tour with audio narration.',
        url: APP_URL,
      });
    } catch { /* cancelled */ }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-bold text-[#A40000] hover:text-[#8a0000] transition-colors text-left"
      >
        <Share2 className="w-4 h-4 shrink-0" />
        Share this App
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden">
          {/* Header */}
          <div className="bg-[#A40000] px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-base leading-tight">Share the Walking Tour</p>
              <p className="text-white/80 text-xs mt-0.5">Free · No download required</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-5 py-5 space-y-5">
            {/* QR Code */}
            <div className="flex flex-col items-center gap-2">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR code for southamptonwalkingtour.com" className="rounded-lg shadow-sm" width={180} height={180} />
              ) : (
                <div className="w-[180px] h-[180px] bg-gray-100 rounded-lg animate-pulse" />
              )}
              <p className="text-xs text-gray-500 text-center">Scan with your phone camera to open</p>
            </div>

            {/* Copyable link */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <span className="flex-1 text-xs text-gray-600 truncate">{APP_URL}</span>
              <button
                onClick={copyLink}
                className="flex items-center gap-1 text-xs font-semibold text-[#A40000] hover:text-[#8a0000] shrink-0 transition-colors"
              >
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>

            {/* Native share (mobile) */}
            {'share' in navigator && (
              <button
                onClick={nativeShare}
                className="w-full flex items-center justify-center gap-2 bg-[#A40000] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#8a0000] transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Send via Text / Email / More
              </button>
            )}

            {/* Install hint */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#A40000]" />
                To install as an app
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong>iPhone:</strong> open in Safari → tap Share → &ldquo;Add to Home Screen&rdquo;<br />
                <strong>Android:</strong> tap the menu (⋮) → &ldquo;Add to Home screen&rdquo;
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
