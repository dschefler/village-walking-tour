'use client';

import { useEffect, useState } from 'react';

// Path curves through: college → park → shops → pin
const PATH = 'M 40,150 C 155,105 285,158 450,128 C 580,103 700,88 890,108';

export function WalkingAnimation() {
  const [phase, setPhase] = useState<'playing' | 'fading' | 'gone'>('playing');

  useEffect(() => {
    const fade = setTimeout(() => setPhase('fading'), 7200);
    const gone = setTimeout(() => setPhase('gone'), 8800);
    return () => { clearTimeout(fade); clearTimeout(gone); };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div
      style={{
        transition: phase === 'fading' ? 'opacity 1.6s ease' : 'none',
        opacity: phase === 'fading' ? 0 : 1,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <div className="container mx-auto px-4 py-2">
        <svg
          viewBox="0 0 950 200"
          className="w-full max-w-4xl mx-auto block"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Expanding clip reveals dotted path left-to-right */}
            <clipPath id="wt-pathReveal">
              <rect x="0" y="0" height="200">
                <animate
                  attributeName="width"
                  from="0" to="950"
                  dur="5.6s" fill="freeze"
                  calcMode="spline"
                  keyTimes="0;1"
                  keySplines="0.3 0 0.7 1"
                />
              </rect>
            </clipPath>
          </defs>

          {/* ═══════════════════════════════════════════════
              COLLEGE BUILDING
          ═══════════════════════════════════════════════ */}
          <g>
            {/* Main building body */}
            <rect x="100" y="95" width="110" height="90" fill="#f5ede0" stroke="#c4a87c" strokeWidth="1"/>
            {/* Triangular pediment */}
            <polygon points="92,95 218,95 155,57" fill="#f0e4d0" stroke="#c4a87c" strokeWidth="1"/>
            {/* Four columns */}
            <rect x="112" y="95" width="7" height="65" rx="2" fill="#ede0c8"/>
            <rect x="131" y="95" width="7" height="65" rx="2" fill="#ede0c8"/>
            <rect x="168" y="95" width="7" height="65" rx="2" fill="#ede0c8"/>
            <rect x="187" y="95" width="7" height="65" rx="2" fill="#ede0c8"/>
            {/* Door */}
            <rect x="143" y="148" width="24" height="37" rx="3" fill="#8b6340"/>
            <line x1="155" y1="148" x2="155" y2="185" stroke="#c49a6a" strokeWidth="1" opacity="0.5"/>
            {/* Windows */}
            <rect x="103" y="108" width="22" height="18" rx="1" fill="#c8e8f4" stroke="#c4a87c" strokeWidth="0.5"/>
            <rect x="185" y="108" width="22" height="18" rx="1" fill="#c8e8f4" stroke="#c4a87c" strokeWidth="0.5"/>
            {/* Steps */}
            <rect x="90" y="183" width="130" height="7" fill="#e0d4bc"/>
            <rect x="84" y="190" width="142" height="7" fill="#d8ccb4"/>
            {/* Flag pole + flag */}
            <line x1="155" y1="57" x2="155" y2="26" stroke="#ccc" strokeWidth="1.5"/>
            <polygon points="155,26 181,33 155,42" fill="#A40000"/>
          </g>

          {/* ═══════════════════════════════════════════════
              PARK / NATURE PATH
          ═══════════════════════════════════════════════ */}

          {/* Tree 1 */}
          <g>
            <rect x="322" y="149" width="7" height="41" fill="#7a5230"/>
            <ellipse cx="325" cy="127" rx="22" ry="28" fill="#5aac5a"/>
            <ellipse cx="325" cy="117" rx="14" ry="16" fill="#74c874" opacity="0.85"/>
          </g>
          {/* Tree 2 — tallest */}
          <g>
            <rect x="383" y="143" width="8" height="47" fill="#7a5230"/>
            <ellipse cx="387" cy="111" rx="29" ry="35" fill="#4a9a4a"/>
            <ellipse cx="387" cy="99"  rx="19" ry="21" fill="#5aaa5a" opacity="0.9"/>
          </g>
          {/* Tree 3 */}
          <g>
            <rect x="443" y="147" width="7" height="43" fill="#7a5230"/>
            <ellipse cx="446" cy="121" rx="24" ry="30" fill="#5aac5a"/>
            <ellipse cx="446" cy="111" rx="16" ry="18" fill="#6aba6a" opacity="0.85"/>
          </g>
          {/* Tree 4 — smaller, back right */}
          <g>
            <rect x="490" y="153" width="6" height="37" fill="#7a5230"/>
            <ellipse cx="493" cy="133" rx="18" ry="22" fill="#4a9a4a"/>
          </g>
          {/* Ground bushes */}
          <ellipse cx="360" cy="168" rx="22" ry="10" fill="#4a9a4a" opacity="0.55"/>
          <ellipse cx="417" cy="172" rx="16" ry="8"  fill="#5aaa5a" opacity="0.5"/>
          <ellipse cx="469" cy="166" rx="19" ry="9"  fill="#4a9a4a" opacity="0.55"/>
          {/* Park bench */}
          <rect x="405" y="162" width="32" height="4" rx="1" fill="#9a7855"/>
          <line x1="408" y1="166" x2="408" y2="177" stroke="#9a7855" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="434" y1="166" x2="434" y2="177" stroke="#9a7855" strokeWidth="2.5" strokeLinecap="round"/>

          {/* ═══════════════════════════════════════════════
              TOWN / SHOPS
          ═══════════════════════════════════════════════ */}

          {/* Shop 1 — Cafe, gable roof, orange awning */}
          <g>
            <rect x="559" y="100" width="63" height="90" fill="#f2e4cc" stroke="#c0a070" strokeWidth="1"/>
            {/* Gable */}
            <polygon points="553,100 628,100 590,73" fill="#e8d8b8" stroke="#c0a070" strokeWidth="1"/>
            {/* Awning */}
            <rect x="552" y="112" width="75" height="12" fill="#C46538" rx="1"/>
            {/* Windows */}
            <rect x="563" y="123" width="18" height="15" rx="1" fill="#c8e8f4" stroke="#c0a070" strokeWidth="0.5"/>
            <rect x="599" y="123" width="16" height="15" rx="1" fill="#c8e8f4" stroke="#c0a070" strokeWidth="0.5"/>
            {/* Door */}
            <rect x="577" y="157" width="20" height="33" rx="2" fill="#8b6340"/>
          </g>

          {/* Shop 2 — Taller, parapet roof, sign */}
          <g>
            <rect x="630" y="82" width="84" height="108" fill="#ecdcc4" stroke="#c0a070" strokeWidth="1"/>
            {/* Parapet */}
            <rect x="624" y="74" width="96" height="9" fill="#ddc8a8" stroke="#c0a070" strokeWidth="1"/>
            {/* Sign board */}
            <rect x="640" y="89" width="64" height="13" fill="#8b5230" rx="2"/>
            {/* Windows */}
            <rect x="636" y="110" width="26" height="20" rx="1" fill="#c8e8f4" stroke="#c0a070" strokeWidth="0.5"/>
            <rect x="682" y="110" width="24" height="20" rx="1" fill="#c8e8f4" stroke="#c0a070" strokeWidth="0.5"/>
            {/* Door */}
            <rect x="655" y="152" width="24" height="38" rx="2" fill="#7a5230"/>
          </g>

          {/* Shop 3 — Blue awning, display window */}
          <g>
            <rect x="722" y="100" width="63" height="90" fill="#f0e0c8" stroke="#c0a070" strokeWidth="1"/>
            {/* Blue awning */}
            <rect x="716" y="110" width="75" height="12" fill="#4080a8" rx="1"/>
            {/* Display window */}
            <rect x="726" y="120" width="51" height="22" rx="1" fill="#c8e8f4" stroke="#c0a070" strokeWidth="0.5"/>
            {/* Door */}
            <rect x="742" y="155" width="20" height="35" rx="2" fill="#7a5230"/>
          </g>

          {/* ═══════════════════════════════════════════════
              RED DOTTED PATH
          ═══════════════════════════════════════════════ */}
          <path
            d={PATH}
            stroke="#A40000"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="7 5"
            clipPath="url(#wt-pathReveal)"
          />
          {/* Hidden reference path for animateMotion */}
          <path id="wt-motionPath" d={PATH} stroke="none" fill="none" />

          {/* ═══════════════════════════════════════════════
              LOCATION PIN
          ═══════════════════════════════════════════════ */}
          <g opacity="0">
            <animate attributeName="opacity" from="0" to="1" begin="5.9s" dur="0.4s" fill="freeze"/>
            <circle cx="890" cy="87" r="13" fill="#A40000"/>
            <circle cx="890" cy="87" r="6"  fill="white"/>
            <polygon points="890,104 879,91 901,91" fill="#A40000"/>
            {/* Pulse ring */}
            <circle cx="890" cy="87" r="13" fill="none" stroke="#A40000" strokeWidth="2" opacity="0">
              <animate attributeName="r"       from="13" to="30"  begin="6.3s" dur="0.8s" fill="freeze"/>
              <animate attributeName="opacity" from="0.6" to="0"  begin="6.3s" dur="0.8s" fill="freeze"/>
            </circle>
          </g>

          {/* ═══════════════════════════════════════════════
              STICK FIGURE  (bigger, walks 6 s)
              — hidden until motion positions it on the path
              — 16 limb cycles × 0.38 s ≈ 6.1 s walk
          ═══════════════════════════════════════════════ */}
          <g stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0">
            <animate attributeName="opacity" from="1" to="1" begin="0.05s" dur="0.01s" fill="freeze"/>

            {/* Head */}
            <circle cx="0" cy="-36" r="8" fill="#1a1a1a" stroke="#1a1a1a"/>
            {/* Body */}
            <line x1="0" y1="-28" x2="0" y2="-10"/>

            {/* Left arm */}
            <line x1="0" y1="-22" x2="-13" y2="-15">
              <animateTransform attributeName="transform" type="rotate"
                values="-32 0 -22; 28 0 -22; -32 0 -22"
                keyTimes="0;0.5;1" dur="0.38s" repeatCount="16" fill="freeze"/>
            </line>
            {/* Right arm — opposite phase */}
            <line x1="0" y1="-22" x2="13" y2="-15">
              <animateTransform attributeName="transform" type="rotate"
                values="32 0 -22; -28 0 -22; 32 0 -22"
                keyTimes="0;0.5;1" dur="0.38s" repeatCount="16" fill="freeze"/>
            </line>

            {/* Left leg */}
            <line x1="0" y1="-10" x2="-10" y2="3">
              <animateTransform attributeName="transform" type="rotate"
                values="-38 0 -10; 38 0 -10; -38 0 -10"
                keyTimes="0;0.5;1" dur="0.38s" repeatCount="16" fill="freeze"/>
            </line>
            {/* Right leg — opposite phase */}
            <line x1="0" y1="-10" x2="10" y2="3">
              <animateTransform attributeName="transform" type="rotate"
                values="38 0 -10; -38 0 -10; 38 0 -10"
                keyTimes="0;0.5;1" dur="0.38s" repeatCount="16" fill="freeze"/>
            </line>

            {/* Motion along path — upright, ease in-out, 6 seconds */}
            <animateMotion
              dur="6s" fill="freeze" rotate="0"
              calcMode="spline"
              keyPoints="0;1" keyTimes="0;1"
              keySplines="0.3 0 0.7 1"
            >
              <mpath href="#wt-motionPath"/>
            </animateMotion>
          </g>

        </svg>
      </div>
    </div>
  );
}
