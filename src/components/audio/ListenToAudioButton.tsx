'use client';

import { useState } from 'react';
import { Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from './AudioPlayer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ListenToAudioButtonProps {
  audioUrl?: string | null;
  siteId: string;
  siteName: string;
  className?: string;
}

export function ListenToAudioButton({
  audioUrl,
  siteId,
  siteName,
  className = '',
}: ListenToAudioButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasAudio = !!audioUrl;

  return (
    <>
      <Button
        onClick={() => hasAudio && setIsOpen(true)}
        className={`w-full bg-[#A40000] hover:bg-[#8a0000] text-white font-semibold ${className}`}
        size="lg"
        disabled={!hasAudio}
      >
        <Volume2 className="w-5 h-5 mr-2" />
        <span>{hasAudio ? 'Listen to Audio' : 'Audio Coming Soon'}</span>
      </Button>

      {hasAudio && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Audio Guide
              </DialogTitle>
            </DialogHeader>
            <AudioPlayer
              audioUrl={audioUrl}
              siteId={siteId}
              siteName={siteName}
              autoPlay
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
