import Script from 'next/script';

/**
 * Company-level visitor identification (Leadfeeder/Dealfront's free tier) —
 * matches visitor IPs to companies so inbound leads can be spotted and
 * followed up on by email, without identifying individual people. No-op
 * until NEXT_PUBLIC_LEADFEEDER_TRACK_ID is set, so this is safe to leave in
 * place before signup is complete.
 *
 * The script body below is the tracker's long-documented install format
 * (window.ldfdr + lftracker_v1_<id>.js). Leadfeeder/Dealfront occasionally
 * revises this — after creating the account, compare this against the exact
 * snippet shown in Settings → Website Tracking, and replace the body here if
 * it differs.
 */
export function LeadfeederTracker() {
  const trackId = process.env.NEXT_PUBLIC_LEADFEEDER_TRACK_ID;
  if (!trackId) {
    return null;
  }
  return (
    <Script id="leadfeeder-tracker" strategy="afterInteractive">
      {`
        (function (ss, ex) {
          window.ldfdr = window.ldfdr || function () {
            (ldfdr._q = ldfdr._q || []).push([].slice.call(arguments));
          };
          (function (d, s) {
            var fs = d.getElementsByTagName(s)[0];
            function ce(src) {
              var cs = d.createElement(s);
              cs.src = src;
              cs.async = 1;
              fs.parentNode.insertBefore(cs, fs);
            }
            ce('https://sc.lfeeder.com/lftracker_v1_' + ss + (ex ? '_' + ex : '') + '.js');
          })(document, 'script');
        })('${trackId}');
      `}
    </Script>
  );
}
