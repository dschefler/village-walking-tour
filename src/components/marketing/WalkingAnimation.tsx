'use client';

import { useEffect, useState } from 'react';

// Curved path matching the SVG viewBox (0 0 900 130)
const PATH = 'M 30,95 C 150,55 300,115 480,75 S 720,45 860,78';

export function WalkingAnimation() {
  const [phase, setPhase] = useState<'playing' | 'fading' | 'gone'>('playing');

  useEffect(() => {
    const fade = setTimeout(() => setPhase('fading'), 4000);
    const gone = setTimeout(() => setPhase('gone'), 5000);
    return () => { clearTimeout(fade); clearTimeout(gone); };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div
      style={{
        transition: phase === 'fading' ? 'opacity 1s ease, max-height 1s ease' : 'none',
        opacity: phase === 'fading' ? 0 : 1,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <div className="container mx-auto px-4 py-4">
        <svg
          viewBox="0 0 900 130"
          className="w-full max-w-3xl mx-auto block"
          style={{ height: '88px' }}
        >
          <defs>
            {/* Expanding clip reveals the dotted path left-to-right */}
            <clipPath id="pathReveal">
              <rect x="0" y="0" height="130">
                <animate
                  attributeName="width"
                  from="0"
                  to="900"
                  dur="2.6s"
                  fill="freeze"
                  calcMode="spline"
                  keyTimes="0;1"
                  keySplines="0.3 0 0.7 1"
                />
              </rect>
            </clipPath>
          </defs>

          {/* The dotted red curved path */}
          <path
            d={PATH}
            stroke="#A40000"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="7 5"
            clipPath="url(#pathReveal)"
          />

          {/* Hidden path used only by animateMotion */}
          <path id="motionPath" d={PATH} stroke="none" fill="none" />

          {/* Location pin — fades + scales in at destination */}
          <g opacity="0">
            <animate attributeName="opacity" from="0" to="1" begin="2.9s" dur="0.35s" fill="freeze" />
            {/* pin body (teardrop via circle + polygon) */}
            <circle cx="860" cy="64" r="12" fill="#A40000" />
            <circle cx="860" cy="64" r="5.5" fill="white" />
            <polygon points="860,80 851,68 869,68" fill="#A40000" />
            {/* pulse ring */}
            <circle cx="860" cy="64" r="12" fill="none" stroke="#A40000" strokeWidth="2" opacity="0">
              <animate attributeName="r" from="12" to="28" begin="3.2s" dur="0.7s" fill="freeze" />
              <animate attributeName="opacity" from="0.7" to="0" begin="3.2s" dur="0.7s" fill="freeze" />
            </circle>
          </g>

          {/* Stick figure — hidden until motion starts (prevents flash at origin) */}
          <g stroke="#222" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0">
            <animate attributeName="opacity" from="1" to="1" begin="0.05s" dur="0.01s" fill="freeze" />

            {/* Head */}
            <circle cx="0" cy="-27" r="6" fill="#222" stroke="#222" />

            {/* Body */}
            <line x1="0" y1="-21" x2="0" y2="-5" />

            {/* Left arm — swings forward/back */}
            <line x1="0" y1="-17" x2="-9" y2="-10">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-30 0 -17; 28 0 -17; -30 0 -17"
                keyTimes="0;0.5;1"
                dur="0.38s"
                repeatCount="indefinite"
              />
            </line>

            {/* Right arm — opposite phase */}
            <line x1="0" y1="-17" x2="9" y2="-10">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="30 0 -17; -28 0 -17; 30 0 -17"
                keyTimes="0;0.5;1"
                dur="0.38s"
                repeatCount="indefinite"
              />
            </line>

            {/* Left leg */}
            <line x1="0" y1="-5" x2="-7" y2="9">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-36 0 -5; 36 0 -5; -36 0 -5"
                keyTimes="0;0.5;1"
                dur="0.38s"
                repeatCount="indefinite"
              />
            </line>

            {/* Right leg — opposite phase */}
            <line x1="0" y1="-5" x2="7" y2="9">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="36 0 -5; -36 0 -5; 36 0 -5"
                keyTimes="0;0.5;1"
                dur="0.38s"
                repeatCount="indefinite"
              />
            </line>

            {/* Motion along the path — rotate="0" keeps figure upright */}
            <animateMotion
              dur="3s"
              fill="freeze"
              rotate="0"
              calcMode="spline"
              keyPoints="0;1"
              keyTimes="0;1"
              keySplines="0.3 0 0.7 1"
            >
              <mpath href="#motionPath" />
            </animateMotion>
          </g>
        </svg>
      </div>
    </div>
  );
}
