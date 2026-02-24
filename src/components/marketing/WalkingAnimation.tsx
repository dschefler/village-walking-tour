'use client';

import { useEffect, useState } from 'react';

export function WalkingAnimation() {
  const [phase, setPhase] = useState<'playing' | 'fading' | 'gone'>('playing');

  useEffect(() => {
    const fade = setTimeout(() => setPhase('fading'), 9000);
    const gone = setTimeout(() => setPhase('gone'), 10500);
    return () => { clearTimeout(fade); clearTimeout(gone); };
  }, []);

  if (phase === 'gone') return null;

  return (
    <>
      <style>{`
        @keyframes wt-bg-scroll {
          from { transform: translateX(900px); }
          to   { transform: translateX(-960px); }
        }
      `}</style>
      <div
        style={{
          transition: phase === 'fading' ? 'opacity 1.5s ease' : 'none',
          opacity: phase === 'fading' ? 0 : 1,
        }}
        aria-hidden="true"
      >
        <div className="container mx-auto px-4 pt-3 pb-0">
          <div
            className="relative mx-auto overflow-hidden"
            style={{
              maxWidth: '896px',
              height: '220px',
              background: 'linear-gradient(to bottom, #c8dff0 0%, #ddeeff 40%, #eee8d8 72%, #ddd4c0 82%, #ccc4b0 100%)',
            }}
          >

            {/* ── Scrolling background scene ── */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '950px',
                height: '220px',
                animation: 'wt-bg-scroll 9s linear forwards',
                willChange: 'transform',
              }}
            >
              <svg viewBox="0 0 950 220" width="950" height="220" xmlns="http://www.w3.org/2000/svg">

                {/* Ground / sidewalk */}
                <rect x="0" y="176" width="950" height="14" fill="#e8e0d0"/>
                <rect x="0" y="190" width="950" height="7"  fill="#d8d0be"/>
                <rect x="0" y="197" width="950" height="23" fill="#ccc4b0"/>

                {/* ═══════════ COLLEGE BUILDING ═══════════ */}
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
                  <line x1="156" y1="52"  x2="156" y2="22" stroke="#bbb" strokeWidth="1.5"/>
                  <polygon points="156,22 183,29 156,38" fill="#A40000"/>
                </g>

                {/* ═══════════ PARK TREES ═══════════ */}
                <g>
                  <rect x="322" y="151" width="8"  height="25" fill="#7a5230"/>
                  <ellipse cx="326" cy="126" rx="23" ry="29" fill="#5aac5a"/>
                  <ellipse cx="326" cy="115" rx="15" ry="16" fill="#74c874" opacity="0.85"/>
                </g>
                <g>
                  <rect x="381" y="144" width="9"  height="32" fill="#7a5230"/>
                  <ellipse cx="385" cy="110" rx="30" ry="37" fill="#4a9a4a"/>
                  <ellipse cx="385" cy="97"  rx="20" ry="22" fill="#5aaa5a" opacity="0.9"/>
                </g>
                <g>
                  <rect x="443" y="148" width="8"  height="28" fill="#7a5230"/>
                  <ellipse cx="447" cy="123" rx="25" ry="29" fill="#5aac5a"/>
                  <ellipse cx="447" cy="112" rx="17" ry="18" fill="#6aba6a" opacity="0.85"/>
                </g>
                <g>
                  <rect x="490" y="155" width="7"  height="21" fill="#7a5230"/>
                  <ellipse cx="493" cy="136" rx="17" ry="21" fill="#4a9a4a"/>
                </g>
                <ellipse cx="358" cy="172" rx="22" ry="8"  fill="#3a8a3a" opacity="0.45"/>
                <ellipse cx="416" cy="173" rx="16" ry="6"  fill="#4a9a4a" opacity="0.4"/>
                <ellipse cx="469" cy="170" rx="19" ry="7"  fill="#3a8a3a" opacity="0.45"/>
                <rect x="406" y="164" width="32" height="4" rx="1" fill="#9a7855"/>
                <line x1="409" y1="168" x2="409" y2="178" stroke="#9a7855" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="435" y1="168" x2="435" y2="178" stroke="#9a7855" strokeWidth="2.5" strokeLinecap="round"/>

                {/* ═══════════ CAFÉ ═══════════ */}
                <g>
                  <rect x="556" y="86"  width="72" height="90" fill="#f2e4cc" stroke="#c0a070" strokeWidth="1.2"/>
                  <polygon points="549,86 634,86 592,58" fill="#e8d8b8" stroke="#c0a070" strokeWidth="1.2"/>
                  <rect x="556" y="86"  width="72" height="19" fill="#8b5230" rx="1"/>
                  <text x="592" y="100" textAnchor="middle" fill="white" fontSize="9.5" fontFamily="sans-serif" fontWeight="bold">CAFÉ</text>
                  <polygon points="548,115 636,115 642,129 542,129" fill="#C46538"/>
                  <line x1="548" y1="115" x2="636" y2="115" stroke="#8b3010" strokeWidth="1.2"/>
                  <rect x="561" y="132" width="20" height="16" rx="1" fill="#c8e8f4" stroke="#c0a070" strokeWidth="0.6"/>
                  <rect x="597" y="132" width="18" height="16" rx="1" fill="#c8e8f4" stroke="#c0a070" strokeWidth="0.6"/>
                  <rect x="576" y="150" width="22" height="26" rx="2" fill="#8b6340"/>
                </g>

                {/* ═══════════ BOOKS ═══════════ */}
                <g>
                  <rect x="636" y="68"  width="88" height="108" fill="#ecdcc4" stroke="#c0a070" strokeWidth="1.2"/>
                  <rect x="629" y="60"  width="102" height="9"   fill="#ddc8a8" stroke="#c0a070" strokeWidth="1.2"/>
                  <rect x="633" y="52"  width="14"  height="9"   fill="#ddc8a8" stroke="#c0a070" strokeWidth="0.8"/>
                  <rect x="654" y="52"  width="14"  height="9"   fill="#ddc8a8" stroke="#c0a070" strokeWidth="0.8"/>
                  <rect x="675" y="52"  width="14"  height="9"   fill="#ddc8a8" stroke="#c0a070" strokeWidth="0.8"/>
                  <rect x="696" y="52"  width="14"  height="9"   fill="#ddc8a8" stroke="#c0a070" strokeWidth="0.8"/>
                  <rect x="717" y="52"  width="11"  height="9"   fill="#ddc8a8" stroke="#c0a070" strokeWidth="0.8"/>
                  <rect x="636" y="68"  width="88"  height="19"  fill="#5a3018" rx="1"/>
                  <text x="680" y="82" textAnchor="middle" fill="white" fontSize="9.5" fontFamily="sans-serif" fontWeight="bold">BOOKS</text>
                  <polygon points="628,105 724,105 730,118 622,118" fill="#4a7060"/>
                  <line x1="628" y1="105" x2="724" y2="105" stroke="#2e4a3a" strokeWidth="1.2"/>
                  <rect x="641" y="121" width="28" height="24" rx="1" fill="#c8e8f4" stroke="#c0a070" strokeWidth="0.6"/>
                  <rect x="689" y="121" width="27" height="24" rx="1" fill="#c8e8f4" stroke="#c0a070" strokeWidth="0.6"/>
                  <rect x="661" y="148" width="22" height="28" rx="2" fill="#7a5230"/>
                </g>

                {/* ═══════════ SHOP ═══════════ */}
                <g>
                  <rect x="732" y="84"  width="70" height="92" fill="#f0e0c8" stroke="#c0a070" strokeWidth="1.2"/>
                  <polygon points="725,84 809,84 767,57" fill="#e8d8b8" stroke="#c0a070" strokeWidth="1.2"/>
                  <rect x="732" y="84"  width="70" height="18" fill="#3a5a88" rx="1"/>
                  <text x="767" y="97" textAnchor="middle" fill="white" fontSize="9" fontFamily="sans-serif" fontWeight="bold">SHOP</text>
                  <polygon points="724,112 809,112 815,125 718,125" fill="#4080a8"/>
                  <line x1="724" y1="112" x2="809" y2="112" stroke="#245070" strokeWidth="1.2"/>
                  <rect x="737" y="128" width="56" height="24" rx="1" fill="#c8e8f4" stroke="#c0a070" strokeWidth="0.6"/>
                  <rect x="754" y="153" width="20" height="23" rx="2" fill="#7a5230"/>
                </g>

                {/* ═══════════ LOCATION PIN ═══════════ */}
                <g opacity="0">
                  <animate attributeName="opacity" from="0" to="1" begin="5.5s" dur="0.4s" fill="freeze"/>
                  <circle cx="870" cy="148" r="14" fill="#A40000"/>
                  <circle cx="870" cy="148" r="6.5" fill="white"/>
                  <polygon points="870,167 858,154 882,154" fill="#A40000"/>
                  <circle cx="870" cy="148" r="14" fill="none" stroke="#A40000" strokeWidth="2" opacity="0">
                    <animate attributeName="r"       from="14" to="32" begin="5.9s" dur="0.8s" fill="freeze"/>
                    <animate attributeName="opacity" from="0.6" to="0"  begin="5.9s" dur="0.8s" fill="freeze"/>
                  </circle>
                </g>
              </svg>
            </div>

            {/* ── Stick figure — SVG directly on canvas, transparent background ──
                Coordinate system: feet at y=0, figure grows upward (negative y).
                Positioned so feet sit on the scene's sidewalk (y=176 in scene = 44px from container bottom).
                Paint order: back leg → back arm → torso → front leg → front arm → head.
                Correct counterswing: right arm back ↔ right leg forward (and vice versa).
            ── */}
            <svg
              viewBox="-40 -80 80 80"
              width="90"
              height="90"
              style={{
                position: 'absolute',
                left: '30px',
                bottom: '44px',
                overflow: 'visible',
                zIndex: 10,
              }}
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Body bob — whole figure bounces gently up/down each step */}
              <g>
                <animateTransform attributeName="transform" type="translate"
                  values="0,0; 0,-2.5; 0,0"
                  keyTimes="0;0.5;1"
                  calcMode="spline"
                  keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
                  dur="0.28s" repeatCount="32" fill="freeze"/>

                <g stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">

                  {/* ── RIGHT LEG (back layer) — forward at t=0 ── */}
                  <g>
                    <path d="M 4,-22 L 8,-7 L 5,12"/>
                    <ellipse cx="5" cy="15" rx="9" ry="3.5" fill="#222" stroke="none"/>
                    <animateTransform attributeName="transform" type="rotate"
                      values="32 4 -22; -30 4 -22; 32 4 -22"
                      keyTimes="0;0.5;1"
                      calcMode="spline"
                      keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
                      dur="0.56s" repeatCount="16" fill="freeze"/>
                  </g>

                  {/* ── RIGHT ARM (back layer) — back at t=0 (counterswings right leg fwd) ── */}
                  <g>
                    <path d="M 4,-48 L 9,-36 L 5,-24"/>
                    {/* Briefcase */}
                    <rect x="2" y="-24" width="9" height="7" rx="1.5" fill="none" stroke="#222" strokeWidth="2"/>
                    <line x1="4" y1="-24" x2="9" y2="-24" stroke="#222" strokeWidth="1.5"/>
                    <animateTransform attributeName="transform" type="rotate"
                      values="-28 4 -48; 28 4 -48; -28 4 -48"
                      keyTimes="0;0.5;1"
                      calcMode="spline"
                      keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
                      dur="0.56s" repeatCount="16" fill="freeze"/>
                  </g>

                  {/* ── TORSO ── */}
                  <ellipse cx="0" cy="-36" rx="11" ry="16" fill="white" stroke="#222" strokeWidth="2.2"/>

                  {/* ── LEFT LEG (front layer) — back at t=0 ── */}
                  <g>
                    <path d="M -4,-22 L -8,-7 L -5,12"/>
                    <ellipse cx="-5" cy="15" rx="9" ry="3.5" fill="#222" stroke="none"/>
                    <animateTransform attributeName="transform" type="rotate"
                      values="-32 -4 -22; 30 -4 -22; -32 -4 -22"
                      keyTimes="0;0.5;1"
                      calcMode="spline"
                      keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
                      dur="0.56s" repeatCount="16" fill="freeze"/>
                  </g>

                  {/* ── LEFT ARM (front layer) — forward at t=0 (counterswings left leg back) ── */}
                  <g>
                    <path d="M -4,-48 L -9,-36 L -5,-24"/>
                    {/* Fist */}
                    <circle cx="-5" cy="-22" r="4" fill="#222" stroke="none"/>
                    <animateTransform attributeName="transform" type="rotate"
                      values="28 -4 -48; -28 -4 -48; 28 -4 -48"
                      keyTimes="0;0.5;1"
                      calcMode="spline"
                      keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
                      dur="0.56s" repeatCount="16" fill="freeze"/>
                  </g>

                  {/* ── HEAD ── */}
                  <ellipse cx="0" cy="-64" rx="13" ry="15" fill="white" stroke="#222" strokeWidth="2.2"/>
                  {/* Neck */}
                  <line x1="0" y1="-52" x2="0" y2="-49"/>

                </g>
              </g>
            </svg>

          </div>
        </div>
      </div>
    </>
  );
}
