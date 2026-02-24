'use client';

import { useEffect, useState } from 'react';

// Nearly flat path — runs at sidewalk level (y≈170-178), buildings tower above
const PATH = 'M 40,178 C 250,174 550,171 910,170';

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
          viewBox="0 0 950 230"
          className="w-full max-w-4xl mx-auto block"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Clip expands left→right to reveal the dotted path */}
            <clipPath id="wt-pathReveal">
              <rect x="0" y="0" height="230">
                <animate
                  attributeName="width"
                  from="0" to="950"
                  dur="5.6s" fill="freeze"
                  calcMode="spline" keyTimes="0;1" keySplines="0.3 0 0.7 1"
                />
              </rect>
            </clipPath>
          </defs>

          {/* ═══════════════════════════════════════════════════
              COLLEGE BUILDING  (base at y=178, grows upward)
          ═══════════════════════════════════════════════════ */}
          <g>
            <rect x="98"  y="95"  width="114" height="83" fill="#f5ede0" stroke="#c4a87c" strokeWidth="1.2"/>
            <polygon points="90,95 222,95 156,54" fill="#f0e4d0" stroke="#c4a87c" strokeWidth="1.2"/>
            {/* Columns */}
            <rect x="110" y="95" width="8" height="60" rx="3" fill="#ede0c8"/>
            <rect x="130" y="95" width="8" height="60" rx="3" fill="#ede0c8"/>
            <rect x="172" y="95" width="8" height="60" rx="3" fill="#ede0c8"/>
            <rect x="192" y="95" width="8" height="60" rx="3" fill="#ede0c8"/>
            {/* Door */}
            <rect x="142" y="140" width="28" height="38" rx="3" fill="#8b6340"/>
            <line x1="156" y1="140" x2="156" y2="178" stroke="#c49a6a" strokeWidth="1" opacity="0.4"/>
            {/* Windows */}
            <rect x="101" y="105" width="24" height="19" rx="1" fill="#c8e8f4" stroke="#c4a87c" strokeWidth="0.7"/>
            <rect x="183" y="105" width="24" height="19" rx="1" fill="#c8e8f4" stroke="#c4a87c" strokeWidth="0.7"/>
            {/* Steps */}
            <rect x="86"  y="178" width="138" height="8"  fill="#e0d4bc"/>
            <rect x="80"  y="186" width="150" height="7"  fill="#d8ccb4"/>
            {/* Flag pole + flag */}
            <line x1="156" y1="54" x2="156" y2="24" stroke="#ccc" strokeWidth="1.5"/>
            <polygon points="156,24 183,31 156,40" fill="#A40000"/>
          </g>

          {/* ═══════════════════════════════════════════════════
              PARK TREES  (trunks end at y=178)
          ═══════════════════════════════════════════════════ */}
          <g>
            <rect x="322" y="153" width="8" height="25" fill="#7a5230"/>
            <ellipse cx="326" cy="128" rx="23" ry="29" fill="#5aac5a"/>
            <ellipse cx="326" cy="117" rx="15" ry="16" fill="#74c874" opacity="0.85"/>
          </g>
          <g>
            <rect x="381" y="146" width="9" height="32" fill="#7a5230"/>
            <ellipse cx="385" cy="112" rx="30" ry="37" fill="#4a9a4a"/>
            <ellipse cx="385" cy="99"  rx="20" ry="22" fill="#5aaa5a" opacity="0.9"/>
          </g>
          <g>
            <rect x="443" y="150" width="8" height="28" fill="#7a5230"/>
            <ellipse cx="447" cy="125" rx="25" ry="29" fill="#5aac5a"/>
            <ellipse cx="447" cy="114" rx="17" ry="18" fill="#6aba6a" opacity="0.85"/>
          </g>
          <g>
            <rect x="490" y="157" width="7" height="21" fill="#7a5230"/>
            <ellipse cx="493" cy="138" rx="17" ry="21" fill="#4a9a4a"/>
          </g>
          {/* Bushes */}
          <ellipse cx="358" cy="173" rx="22" ry="9"  fill="#4a9a4a" opacity="0.55"/>
          <ellipse cx="416" cy="175" rx="16" ry="7"  fill="#5aaa5a" opacity="0.5"/>
          <ellipse cx="469" cy="171" rx="19" ry="8"  fill="#4a9a4a" opacity="0.55"/>
          {/* Bench */}
          <rect x="406" y="167" width="32" height="4" rx="1" fill="#9a7855"/>
          <line x1="409" y1="171" x2="409" y2="181" stroke="#9a7855" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="435" y1="171" x2="435" y2="181" stroke="#9a7855" strokeWidth="2.5" strokeLinecap="round"/>

          {/* ═══════════════════════════════════════════════════
              TOWN SHOPS  (base at y=178, awnings protrude outward)
          ═══════════════════════════════════════════════════ */}

          {/* SHOP 1 — CAFÉ — gable roof, orange awning */}
          <g>
            <rect x="556" y="88"  width="72" height="90" fill="#f2e4cc" stroke="#c0a070" strokeWidth="1.2"/>
            <polygon points="549,88 634,88 592,60" fill="#e8d8b8" stroke="#c0a070" strokeWidth="1.2"/>
            {/* Sign */}
            <rect x="556" y="88" width="72" height="19" fill="#8b5230" rx="1"/>
            <text x="592" y="102" textAnchor="middle" fill="white" fontSize="9.5" fontFamily="sans-serif" fontWeight="bold">CAFÉ</text>
            {/* Awning — trapezoid protruding from wall */}
            <polygon points="548,117 636,117 642,131 542,131" fill="#C46538"/>
            <line x1="548" y1="117" x2="636" y2="117" stroke="#8b3010" strokeWidth="1.2"/>
            {/* Windows */}
            <rect x="561" y="134" width="20" height="16" rx="1" fill="#c8e8f4" stroke="#c0a070" strokeWidth="0.6"/>
            <rect x="597" y="134" width="18" height="16" rx="1" fill="#c8e8f4" stroke="#c0a070" strokeWidth="0.6"/>
            {/* Door */}
            <rect x="576" y="152" width="22" height="26" rx="2" fill="#8b6340"/>
          </g>

          {/* SHOP 2 — BOOKS — tallest, parapet with notches */}
          <g>
            <rect x="636" y="70"  width="88" height="108" fill="#ecdcc4" stroke="#c0a070" strokeWidth="1.2"/>
            {/* Parapet + notches */}
            <rect x="629" y="62"  width="102" height="9"  fill="#ddc8a8" stroke="#c0a070" strokeWidth="1.2"/>
            <rect x="633" y="54"  width="14" height="9"   fill="#ddc8a8" stroke="#c0a070" strokeWidth="0.8"/>
            <rect x="654" y="54"  width="14" height="9"   fill="#ddc8a8" stroke="#c0a070" strokeWidth="0.8"/>
            <rect x="675" y="54"  width="14" height="9"   fill="#ddc8a8" stroke="#c0a070" strokeWidth="0.8"/>
            <rect x="696" y="54"  width="14" height="9"   fill="#ddc8a8" stroke="#c0a070" strokeWidth="0.8"/>
            <rect x="717" y="54"  width="11" height="9"   fill="#ddc8a8" stroke="#c0a070" strokeWidth="0.8"/>
            {/* Sign */}
            <rect x="636" y="70" width="88" height="19" fill="#5a3018" rx="1"/>
            <text x="680" y="84" textAnchor="middle" fill="white" fontSize="9.5" fontFamily="sans-serif" fontWeight="bold">BOOKS</text>
            {/* Awning — green, wide */}
            <polygon points="628,107 724,107 730,120 622,120" fill="#4a7060"/>
            <line x1="628" y1="107" x2="724" y2="107" stroke="#2e4a3a" strokeWidth="1.2"/>
            {/* Windows */}
            <rect x="641" y="123" width="28" height="24" rx="1" fill="#c8e8f4" stroke="#c0a070" strokeWidth="0.6"/>
            <rect x="689" y="123" width="27" height="24" rx="1" fill="#c8e8f4" stroke="#c0a070" strokeWidth="0.6"/>
            {/* Door */}
            <rect x="661" y="150" width="22" height="28" rx="2" fill="#7a5230"/>
          </g>

          {/* SHOP 3 — SHOP — gable roof, blue awning, display window */}
          <g>
            <rect x="732" y="86"  width="70" height="92" fill="#f0e0c8" stroke="#c0a070" strokeWidth="1.2"/>
            <polygon points="725,86 809,86 767,59" fill="#e8d8b8" stroke="#c0a070" strokeWidth="1.2"/>
            {/* Sign */}
            <rect x="732" y="86" width="70" height="18" fill="#3a5a88" rx="1"/>
            <text x="767" y="99" textAnchor="middle" fill="white" fontSize="9" fontFamily="sans-serif" fontWeight="bold">SHOP</text>
            {/* Awning — blue */}
            <polygon points="724,114 809,114 815,127 718,127" fill="#4080a8"/>
            <line x1="724" y1="114" x2="809" y2="114" stroke="#245070" strokeWidth="1.2"/>
            {/* Large display window */}
            <rect x="737" y="130" width="56" height="24" rx="1" fill="#c8e8f4" stroke="#c0a070" strokeWidth="0.6"/>
            {/* Door */}
            <rect x="754" y="155" width="20" height="23" rx="2" fill="#7a5230"/>
          </g>

          {/* ═══════════════════════════════════════════════════
              DOTTED RED PATH  (at sidewalk/base level)
          ═══════════════════════════════════════════════════ */}
          <path
            d={PATH}
            stroke="#A40000" strokeWidth="2.5" fill="none" strokeDasharray="7 5"
            clipPath="url(#wt-pathReveal)"
          />
          <path id="wt-motionPath" d={PATH} stroke="none" fill="none"/>

          {/* ═══════════════════════════════════════════════════
              LOCATION PIN  (at path endpoint)
          ═══════════════════════════════════════════════════ */}
          <g opacity="0">
            <animate attributeName="opacity" from="0" to="1" begin="5.9s" dur="0.4s" fill="freeze"/>
            <circle cx="910" cy="153" r="14" fill="#A40000"/>
            <circle cx="910" cy="153" r="6.5" fill="white"/>
            <polygon points="910,172 898,159 922,159" fill="#A40000"/>
            {/* Pulse ring */}
            <circle cx="910" cy="153" r="14" fill="none" stroke="#A40000" strokeWidth="2" opacity="0">
              <animate attributeName="r"       from="14" to="32" begin="6.3s" dur="0.8s" fill="freeze"/>
              <animate attributeName="opacity" from="0.6" to="0"  begin="6.3s" dur="0.8s" fill="freeze"/>
            </circle>
          </g>

          {/* ═══════════════════════════════════════════════════
              STICK FIGURE  — app-style:
                hollow oval head, hollow oval torso,
                L-shaped bent arms with fists,
                L-shaped bent legs with feet.
              Feet at y=0 (local) = path level via animateMotion.
              Paint order: back leg → back arm → torso → front leg → front arm → head
          ═══════════════════════════════════════════════════ */}
          <g stroke="#1a1a1a" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"
             fill="none" opacity="0">
            <animate attributeName="opacity" from="1" to="1" begin="0.05s" dur="0.01s" fill="freeze"/>

            {/* RIGHT LEG (back) */}
            <g>
              <path d="M 0,-16 L 10,-3 L 8,9"/>
              <ellipse cx="10" cy="12" rx="9" ry="3.5" fill="#1a1a1a" stroke="none"/>
              <animateTransform attributeName="transform" type="rotate"
                values="34 0 -16; -32 0 -16; 34 0 -16"
                keyTimes="0;0.5;1" dur="0.45s" repeatCount="14" fill="freeze"/>
            </g>

            {/* RIGHT ARM (back) */}
            <g>
              <path d="M 0,-38 L 15,-27 L 18,-19"/>
              <rect x="15" y="-24" width="7" height="6" rx="2" fill="#1a1a1a" stroke="none"/>
              <animateTransform attributeName="transform" type="rotate"
                values="28 0 -38; -26 0 -38; 28 0 -38"
                keyTimes="0;0.5;1" dur="0.45s" repeatCount="14" fill="freeze"/>
            </g>

            {/* TORSO — hollow oval (covers back limbs) */}
            <ellipse cx="0" cy="-27" rx="12" ry="15" fill="white" stroke="#1a1a1a" strokeWidth="2.8"/>

            {/* LEFT LEG (front) */}
            <g>
              <path d="M 0,-16 L -10,-3 L -8,9"/>
              <ellipse cx="-10" cy="12" rx="9" ry="3.5" fill="#1a1a1a" stroke="none"/>
              <animateTransform attributeName="transform" type="rotate"
                values="-32 0 -16; 34 0 -16; -32 0 -16"
                keyTimes="0;0.5;1" dur="0.45s" repeatCount="14" fill="freeze"/>
            </g>

            {/* LEFT ARM (front) */}
            <g>
              <path d="M 0,-38 L -15,-27 L -18,-19"/>
              <rect x="-25" y="-23" width="7" height="6" rx="2" fill="#1a1a1a" stroke="none"/>
              <animateTransform attributeName="transform" type="rotate"
                values="-26 0 -38; 28 0 -38; -26 0 -38"
                keyTimes="0;0.5;1" dur="0.45s" repeatCount="14" fill="freeze"/>
            </g>

            {/* HEAD — large hollow oval */}
            <ellipse cx="0" cy="-56" rx="14" ry="17" fill="white" stroke="#1a1a1a" strokeWidth="2.8"/>
            {/* Neck */}
            <line x1="0" y1="-42" x2="0" y2="-39"/>

            {/* Walk along path, upright, ease in-out over 6 s */}
            <animateMotion dur="6s" fill="freeze" rotate="0"
              calcMode="spline" keyPoints="0;1" keyTimes="0;1" keySplines="0.3 0 0.7 1">
              <mpath href="#wt-motionPath"/>
            </animateMotion>
          </g>

        </svg>
      </div>
    </div>
  );
}
