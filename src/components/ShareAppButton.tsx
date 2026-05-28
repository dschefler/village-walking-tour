'use client';

import { useState, useEffect } from 'react';
import { Share2, Copy, Check, X, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useTenantOptional } from '@/lib/context/tenant-context';

const SOUTHAMPTON_URL = 'https://southamptonwalkingtour.com';

export function ShareAppButton() {
  const tenant = useTenantOptional();
  const org = tenant?.organization;

  const appUrl = org
    ? org.custom_domain
      ? `https://${org.custom_domain}`
      : `https://walkingtourbuilder.com/t/${org.slug}`
    : SOUTHAMPTON_URL;
  const appTitle = org ? org.app_name || org.name : 'Southampton Village Historical Walking Tours';
  const primaryColor = org?.primary_color || '#A40000';

  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    QRCode.toDataURL(appUrl, {
      width: 220,
      margin: 2,
      color: { dark: primaryColor, light: '#ffffff' },
    }).then(setQrDataUrl).catch(() => {});
  }, [open, appUrl, primaryColor]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* unavailable */ }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({
        title: appTitle,
        text: 'Free self-guided GPS walking tour with audio narration.',
        url: appUrl,
      });
    } catch { /* cancelled */ }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors text-left"
      >
        <Share2 className="w-4 h-4 shrink-0" />
        Share this App
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: primaryColor }}>
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
                <img src={qrDataUrl} alt={`QR code for ${appUrl}`} className="rounded-lg shadow-sm" width={180} height={180} />
              ) : (
                <div className="w-[180px] h-[180px] bg-gray-100 rounded-lg animate-pulse" />
              )}
              <p className="text-xs text-gray-500 text-center">Scan with your phone camera to open</p>
            </div>

            {/* Copyable link */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <span className="flex-1 text-xs text-gray-600 truncate">{appUrl}</span>
              <button
                onClick={copyLink}
                className="flex items-center gap-1 text-xs font-semibold shrink-0 transition-colors"
                style={{ color: primaryColor }}
              >
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>

            {/* Native share (mobile) */}
            {'share' in navigator && (
              <button
                onClick={nativeShare}
                className="w-full flex items-center justify-center gap-2 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                <Share2 className="w-4 h-4" />
                Send via Text / Email / More
              </button>
            )}

            {/* Install hint */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
                <Smartphone className="w-3.5 h-3.5" style={{ color: primaryColor }} />
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
