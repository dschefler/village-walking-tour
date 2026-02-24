'use client';

import { useEffect, useState } from 'react';

export function WalkingAnimation() {
  const [phase, setPhase] = useState<'playing' | 'fading' | 'gone'>('playing');

  useEffect(() => {
    const fade = setTimeout(() => setPhase('fading'), 3000);
    const gone = setTimeout(() => setPhase('gone'), 4200);
    return () => { clearTimeout(fade); clearTimeout(gone); };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div
      style={{
        transition: phase === 'fading' ? 'opacity 1.2s ease' : 'none',
        opacity: phase === 'fading' ? 0 : 1,
      }}
      aria-hidden="true"
      className="flex justify-center py-1"
    >
      <iframe
        src="https://tenor.com/embed/19530863"
        width="140"
        height="102"
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
}
