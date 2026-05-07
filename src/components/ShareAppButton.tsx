'use client';

import { Share2 } from 'lucide-react';

export function ShareAppButton() {
  const handleShare = async () => {
    const shareData = {
      title: 'Southampton Village Historical Walking Tours',
      text: 'Explore the historic district of Southampton Village with a free self-guided GPS walking tour — audio narration, fun facts, and more.',
      url: 'https://southamptonwalkingtour.com',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed — no-op
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
      } catch {
        // clipboard not available
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="col-span-2 flex items-center justify-center gap-2.5 px-4 py-3 bg-white text-[#A40000] rounded-lg shadow transition-colors hover:bg-white/90 font-bold w-full"
    >
      <Share2 className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm leading-tight">Share this App</span>
    </button>
  );
}
