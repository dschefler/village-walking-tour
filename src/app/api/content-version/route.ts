import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Returns the latest updated_at timestamp across tours and sites.
// The PWA checks this on every app open and prompts refresh if it changed.
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();

  const [{ data: tours }, { data: sites }] = await Promise.all([
    supabase.from('tours').select('updated_at').order('updated_at', { ascending: false }).limit(1),
    supabase.from('sites').select('updated_at').order('updated_at', { ascending: false }).limit(1),
  ]);

  const tourTs = tours?.[0]?.updated_at ?? '0';
  const siteTs = sites?.[0]?.updated_at ?? '0';
  const version = tourTs > siteTs ? tourTs : siteTs;

  return NextResponse.json({ version });
}
