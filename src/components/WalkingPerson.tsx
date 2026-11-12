/**
 * Stick figure walking in place: arms and legs swing in opposite pairs and
 * the body bobs slightly. Pure SVG + CSS so it needs no image or GIF; the
 * global "Stop animations" accessibility setting and prefers-reduced-motion
 * freeze it standing.
 */
export function WalkingPerson({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={3.5}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <style>{`
        .wp-body { animation: wp-bob 0.45s ease-in-out infinite alternate; }
        .wp-limb { transform-box: view-box; animation: wp-swing 0.9s ease-in-out infinite alternate; }
        .wp-arm { transform-origin: 20px 15px; }
        .wp-leg { transform-origin: 20px 28px; }
        .wp-b { animation-delay: -0.9s; }
        @keyframes wp-swing { from { transform: rotate(28deg); } to { transform: rotate(-28deg); } }
        @keyframes wp-bob { from { transform: translateY(0); } to { transform: translateY(-1.5px); } }
        @media (prefers-reduced-motion: reduce) { .wp-body, .wp-limb { animation: none; } }
      `}</style>
      <g className="wp-body">
        <circle cx="20" cy="7" r="4.5" fill="currentColor" stroke="none" />
        <line x1="20" y1="13" x2="20" y2="28" />
        <line className="wp-limb wp-arm wp-b" x1="20" y1="15" x2="20" y2="25" />
        <line className="wp-limb wp-arm" x1="20" y1="15" x2="20" y2="25" />
        <line className="wp-limb wp-leg" x1="20" y1="28" x2="20" y2="43" />
        <line className="wp-limb wp-leg wp-b" x1="20" y1="28" x2="20" y2="43" />
      </g>
    </svg>
  );
}
