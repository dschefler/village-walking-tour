'use client';

import { useEffect, useState } from 'react';

export function WalkingAnimation() {
  const [phase, setPhase] = useState<'playing' | 'fading' | 'gone'>('playing');

  useEffect(() => {
    const fade = setTimeout(() => setPhase('fading'), 5000);
    const gone = setTimeout(() => setPhase('gone'), 6500);
    return () => { clearTimeout(fade); clearTimeout(gone); };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div
      style={{
        transition: phase === 'fading' ? 'opacity 1.5s ease' : 'none',
        opacity: phase === 'fading' ? 0 : 1,
      }}
      aria-hidden="true"
      className="flex justify-center py-2"
    >
      <iframe
        src="https://tenor.com/embed/19530863"
        width="320"
        height="232"
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
}
