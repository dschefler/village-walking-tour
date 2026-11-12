/* eslint-disable @next/next/no-img-element -- animated GIF; next/image would freeze or re-encode it */

/**
 * The same walking stick figure as the Create Your Tour "Start Walking" GIF
 * (Tenor 19530863, self-hosted and cropped in public/). It's black on white,
 * so invert + screen blend turns it into a white figure on whatever color is
 * behind it. "Stop animations" and prefers-reduced-motion swap in a still frame.
 */
export function WalkingPerson({ className }: { className?: string }) {
  return (
    <>
      <style>{`
        html.a11y-no-motion .walking-person { content: url(/walking-man-still.png); }
        @media (prefers-reduced-motion: reduce) { .walking-person { content: url(/walking-man-still.png); } }
      `}</style>
      <img
        src="/walking-man.gif"
        alt=""
        aria-hidden="true"
        width={92}
        height={154}
        className={`walking-person invert mix-blend-screen ${className ?? ''}`}
      />
    </>
  );
}
