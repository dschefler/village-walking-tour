import { NextResponse } from 'next/server';

// Returns a unique ID for the current deployment.
// Used by the PWA to detect code updates independently of the service worker —
// this is the only iOS-reliable update detection mechanism.
export const dynamic = 'force-dynamic';

export function GET() {
  const id =
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.BUILD_ID ||
    'dev';

  return NextResponse.json({ id }, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  });
}
