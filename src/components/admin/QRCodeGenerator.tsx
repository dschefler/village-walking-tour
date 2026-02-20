'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface QRCodeGeneratorProps {
  url: string;
  tourName: string;
  color?: string;
}

export function QRCodeGenerator({ url, tourName, color = '#A30000' }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: 256,
          margin: 2,
          color: {
            dark: color,
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('QR Code generation error:', error);
        }
      );
    }
  }, [url, color]);

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `${tourName.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center p-4 bg-white rounded-lg">
        <canvas ref={canvasRef} />
      </div>

      <div className="flex gap-2">
        <Input value={url} readOnly className="flex-1" />
        <Button variant="outline" size="icon" onClick={handleCopyUrl}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleDownload} className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download QR Code
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Print this QR code and place it at the tour starting point
      </p>
    </div>
  );
}
