'use client';

import { useEffect, useState } from 'react';

// Gently wavy path — no visible stroke, just used for motion
// The undulations give the figure a natural bob as it walks
const MOTION_PATH = 'M 40,176 C 190,169 330,178 490,171 C 620,165 750,174 890,169';

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
      <div className="container mx-auto px-4 pt-4 pb-0">
        <svg
          viewBox="0 0 950 220"
          className="w-full max-w-4xl mx-auto block"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="wt-pathReveal">
              <rect x="0" y="0" height="220">
                <animate
                  attributeName="width"
                  from="0" to="950"
                  dur="5.6s" fill="freeze"
                  calcMode="spline" keyTimes="0;1" keySplines="0.3 0 0.7 1"
                />
              </rect>
            </clipPath>
          </defs>

          {/* ═══════════ COLLEGE BUILDING — base y=176 ═══════════ */}
          <g>
            <rect x="98"  y="90"  width="114" height="86" fill="#f5ede0" stroke="#c4a87c" strokeWidth="1.2"/>
            <polygon points="90,90 222,90 156,52" fill="#f0e4d0" stroke="#c4a87c" strokeWidth="1.2"/>
            <rect x="110" y="90" width="8" height="62" rx="3" fill="#ede0c8"/>
            <rect x="130" y="90" width="8" height="62" rx="3" fill="#ede0c8"/>
            <rect x="172" y="90" width="8" height="62" rx="3" fill="#ede0c8"/>
            <rect x="192" y="90" width="8" height="62" rx="3" fill="#ede0c8"/>
            <rect x="142" y="138" width="28" height="38" rx="3" fill="#8b6340"/>
            <line x1="156" y1="138" x2="156" y2="176" stroke="#c49a6a" strokeWidth="1" opacity="0.4"/>
            <rect x="101" y="100" width="24" height="19" rx="1" fill="#c8e8f4" stroke="#c4a87c" strokeWidth="0.7"/>
            <rect x="183" y="100" width="24" height="19" rx="1" fill="#c8e8f4" stroke="#c4a87c" strokeWidth="0.7"/>
            <rect x="86"  y="176" width="138" height="8"  fill="#e0d4bc"/>
            <rect x="80"  y="184" width="150" height="7"  fill="#d8ccb4"/>
            <line x1="156" y1="52" x2="156" y2="22" stroke="#ccc" strokeWidth="1.5"/>
            <polygon points="156,22 183,29 156,38" fill="#A40000"/>
          </g>

          {/* ═══════════ PARK TREES — trunks end at y=176 ═══════════ */}
          <g>
            <rect x="322" y="151" width="8" height="25" fill="#7a5230"/>
            <ellipse cx="326" cy="126" rx="23" ry="29" fill="#5aac5a"/>
            <ellipse cx="326" cy="115" rx="15" ry="16" fill="#74c874" opacity="0.85"/>
          </g>
          <g>
            <rect x="381" y="144" width="9" height="32" fill="#7a5230"/>
            <ellipse cx="385" cy="110" rx="30" ry="37" fill="#4a9a4a"/>
            <ellipse cx="385" cy="97"  rx="20" ry="22" fill="#5aaa5a" opacity="0.9"/>
          </g>
          <g>
            <rect x="443" y="148" width="8" height="28" fill="#7a5230"/>
            <ellipse cx="447" cy="123" rx="25" ry="29" fill="#5aac5a"/>
            <ellipse cx="447" cy="112" rx="17" ry="18" fill="#6aba6a" opacity="0.85"/>
          </g>
          <g>
            <rect x="490" y="155" width="7" height="21" fill="#7a5230"/>
            <ellipse cx="493" cy="136" rx="17" ry="21" fill="#4a9a4a"/>
          </g>
          <ellipse cx="358" cy="170" rx="22" ry="9"  fill="#4a9a4a" opacity="0.55"/>
          <ellipse cx="416" cy="172" rx="16" ry="7"  fill="#5aaa5a" opacity="0.5"/>
          <ellipse cx="469" cy="168" rx="19" ry="8"  fill="#4a9a4a" opacity="0.55"/>
          <rect x="406" y="164" width="32" height="4" rx="1" fill="#9a7855"/>
          <line x1="409" y1="168" x2="409" y2="178" stroke="#9a7855" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="435" y1="168" x2="435" y2="178" stroke="#9a7855" strokeWidth="2.5" strokeLinecap="round"/>

          {/* ═══════════ TOWN SHOPS — base y=176 ═══════════ */}

          {/* CAFÉ */}
          <g>
            <rect x="556" y="86"  width="72" height="90" fill="#f2e4cc" stroke="#c0a070" strokeWidth="1.2"/>
            <polygon points="549,86 634,86 592,58" fill="#e8d8b8" stroke="#c0a070" strokeWidth="1.2"/>
            <rect x="556" y="86" width="72" height="19" fill="#8b5230" rx="1"/>
            <text x="592" y="100" textAnchor="middle" fill="white" fontSize="9.5" fontFamily="sans-serif" fontWeight="bold">CAFÉ</text>
            <polygon points="548,115 636,115 642,129 542,129" fill="#C46538"/>
            <line x1="548" y1="115" x2="636" y2="115" stroke="#8b3010" strokeWidth="1.2"/>
            <rect x="561" y="132" width="20" height="16" rx="1" fill="#c8e8f4" stroke="#c0a070" strokeWidth="0.6"/>
            <rect x="597" y="132" width="18" height="16" rx="1" fill="#c8e8f4" stroke="#c0a070" strokeWidth="0.6"/>
            <rect x="576" y="150" width="22" height="26" rx="2" fill="#8b6340"/>
          </g>

          {/* BOOKS */}
          <g>
            <rect x="636" y="68"  width="88" height="108" fill="#ecdcc4" stroke="#c0a070" strokeWidth="1.2"/>
            <rect x="629" y="60"  width="102" height="9"  fill="#ddc8a8" stroke="#c0a070" strokeWidth="1.2"/>
            <rect x="633" y="52"  width="14" height="9"   fill="#ddc8a8" stroke="#c0a070" strokeWidth="0.8"/>
            <rect x="654" y="52"  width="14" height="9"   fill="#ddc8a8" stroke="#c0a070" strokeWidth="0.8"/>
            <rect x="675" y="52"  width="14" height="9"   fill="#ddc8a8" stroke="#c0a070" strokeWidth="0.8"/>
            <rect x="696" y="52"  width="14" height="9"   fill="#ddc8a8" stroke="#c0a070" strokeWidth="0.8"/>
            <rect x="717" y="52"  width="11" height="9"   fill="#ddc8a8" stroke="#c0a070" strokeWidth="0.8"/>
            <rect x="636" y="68" width="88" height="19" fill="#5a3018" rx="1"/>
            <text x="680" y="82" textAnchor="middle" fill="white" fontSize="9.5" fontFamily="sans-serif" fontWeight="bold">BOOKS</text>
            <polygon points="628,105 724,105 730,118 622,118" fill="#4a7060"/>
            <line x1="628" y1="105" x2="724" y2="105" stroke="#2e4a3a" strokeWidth="1.2"/>
            <rect x="641" y="121" width="28" height="24" rx="1" fill="#c8e8f4" stroke="#c0a070" strokeWidth="0.6"/>
            <rect x="689" y="121" width="27" height="24" rx="1" fill="#c8e8f4" stroke="#c0a070" strokeWidth="0.6"/>
            <rect x="661" y="148" width="22" height="28" rx="2" fill="#7a5230"/>
          </g>

          {/* SHOP */}
          <g>
            <rect x="732" y="84"  width="70" height="92" fill="#f0e0c8" stroke="#c0a070" strokeWidth="1.2"/>
            <polygon points="725,84 809,84 767,57" fill="#e8d8b8" stroke="#c0a070" strokeWidth="1.2"/>
            <rect x="732" y="84" width="70" height="18" fill="#3a5a88" rx="1"/>
            <text x="767" y="97" textAnchor="middle" fill="white" fontSize="9" fontFamily="sans-serif" fontWeight="bold">SHOP</text>
            <polygon points="724,112 809,112 815,125 718,125" fill="#4080a8"/>
            <line x1="724" y1="112" x2="809" y2="112" stroke="#245070" strokeWidth="1.2"/>
            <rect x="737" y="128" width="56" height="24" rx="1" fill="#c8e8f4" stroke="#c0a070" strokeWidth="0.6"/>
            <rect x="754" y="153" width="20" height="23" rx="2" fill="#7a5230"/>
          </g>

          {/* ═══════════ LOCATION PIN ═══════════ */}
          <g opacity="0">
            <animate attributeName="opacity" from="0" to="1" begin="5.9s" dur="0.4s" fill="freeze"/>
            <circle cx="910" cy="150" r="14" fill="#A40000"/>
            <circle cx="910" cy="150" r="6.5" fill="white"/>
            <polygon points="910,169 898,156 922,156" fill="#A40000"/>
            <circle cx="910" cy="150" r="14" fill="none" stroke="#A40000" strokeWidth="2" opacity="0">
              <animate attributeName="r"       from="14" to="32" begin="6.3s" dur="0.8s" fill="freeze"/>
              <animate attributeName="opacity" from="0.6" to="0"  begin="6.3s" dur="0.8s" fill="freeze"/>
            </circle>
          </g>

          {/* ═══════════ HIDDEN MOTION PATH (no stroke) ═══════════ */}
          <path id="wt-motionPath" d={MOTION_PATH} stroke="none" fill="none"/>

          {/* ═══════════════════════════════════════════════════════
              STICK FIGURE — app GIF style
              • Large hollow oval head
              • Large hollow egg-shaped torso
              • L-shaped arms: left has fist, right carries briefcase
              • Wide-stride L-shaped legs with flat oval feet
              • Organic timing: 4-keyframe limbs with varied easing
                (left arm/right leg share different timing than right arm/left leg)
              • Feet at y=0 → placed on path by animateMotion
              Paint order: back leg → back arm → torso → front leg → front arm → head
          ═══════════════════════════════════════════════════════ */}
          <g stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
             fill="none" opacity="0">
            <animate attributeName="opacity" from="1" to="1" begin="0.05s" dur="0.01s" fill="freeze"/>

            {/* ── RIGHT LEG (back) ── wider stride, foot tilts naturally */}
            <g>
              <path d="M 2,-17 L 12,-2 L 10,11"/>
              <ellipse cx="12" cy="14" rx="10" ry="4" fill="#1a1a1a" stroke="none"/>
              <animateTransform attributeName="transform" type="rotate"
                values="34 2 -17; 12 2 -17; -30 2 -17; 34 2 -17"
                keyTimes="0;0.28;0.55;1"
                calcMode="spline"
                keySplines="0.4 0 0.7 1; 0.3 0 0.6 1; 0.5 0 0.8 1"
                dur="0.44s" repeatCount="14" fill="freeze"/>
            </g>

            {/* ── RIGHT ARM (back) — holds briefcase, swings back */}
            <g>
              <path d="M 2,-39 L 16,-27 L 19,-18"/>
              {/* Briefcase */}
              <rect x="16" y="-23" width="10" height="8" rx="2" fill="none" stroke="#1a1a1a" strokeWidth="2.5"/>
              <line x1="18" y1="-23" x2="24" y2="-23" stroke="#1a1a1a" strokeWidth="1.8"/>
              <animateTransform attributeName="transform" type="rotate"
                values="30 2 -39; 10 2 -39; -26 2 -39; 30 2 -39"
                keyTimes="0;0.22;0.52;1"
                calcMode="spline"
                keySplines="0.5 0 0.8 1; 0.3 0 0.6 1; 0.4 0 0.9 1"
                dur="0.44s" repeatCount="14" fill="freeze"/>
            </g>

            {/* ── TORSO — hollow egg shape, slightly wider at hips */}
            <ellipse cx="0" cy="-28" rx="13" ry="17" fill="white" stroke="#1a1a1a" strokeWidth="3"/>

            {/* ── LEFT LEG (front) — widest stride, natural heel strike */}
            <g>
              <path d="M -2,-17 L -12,-2 L -10,11"/>
              <ellipse cx="-12" cy="14" rx="10" ry="4" fill="#1a1a1a" stroke="none"/>
              <animateTransform attributeName="transform" type="rotate"
                values="-32 -2 -17; -10 -2 -17; 32 -2 -17; -32 -2 -17"
                keyTimes="0;0.3;0.56;1"
                calcMode="spline"
                keySplines="0.3 0 0.5 1; 0.4 0 0.7 1; 0.5 0 0.8 1"
                dur="0.44s" repeatCount="14" fill="freeze"/>
            </g>

            {/* ── LEFT ARM (front) — bent up, fist near chest, more exaggerated */}
            <g>
              <path d="M -2,-39 L -16,-27 L -19,-17"/>
              {/* Fist */}
              <rect x="-26" y="-21" width="8" height="7" rx="2" fill="#1a1a1a" stroke="none"/>
              <animateTransform attributeName="transform" type="rotate"
                values="-26 -2 -39; -6 -2 -39; 34 -2 -39; -26 -2 -39"
                keyTimes="0;0.25;0.55;1"
                calcMode="spline"
                keySplines="0.3 0 0.6 1; 0.4 0 0.7 1; 0.5 0 0.8 1"
                dur="0.44s" repeatCount="14" fill="freeze"/>
            </g>

            {/* ── HEAD — large hollow oval, slightly forward-leaning */}
            <ellipse cx="2" cy="-58" rx="15" ry="18" fill="white" stroke="#1a1a1a" strokeWidth="3"/>
            {/* Neck */}
            <line x1="2" y1="-40" x2="1" y2="-45"/>

            {/* Walk along gentle wavy path — ease in-out, 6 s */}
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
