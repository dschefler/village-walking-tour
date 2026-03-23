import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Returns the latest updated_at timestamp for a given org's tours and sites.
// The PWA checks this on every app open and prompts a refresh if it changed.
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgSlug = searchParams.get('org');

  const supabase = createClient();

  // Resolve org ID if slug provided
  let orgId: string | null = null;
  if (orgSlug) {
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', orgSlug)
      .single();
    orgId = org?.id ?? null;
  }

  const [toursQuery, sitesQuery] = await Promise.all([
    orgId
      ? supabase.from('tours').select('updated_at').eq('organization_id', orgId).order('updated_at', { ascending: false }).limit(1)
      : supabase.from('tours').select('updated_at').order('updated_at', { ascending: false }).limit(1),
    orgId
      ? supabase.from('sites').select('updated_at').eq('organization_id', orgId).order('updated_at', { ascending: false }).limit(1)
      : supabase.from('sites').select('updated_at').order('updated_at', { ascending: false }).limit(1),
  ]);

  const tourTs = toursQuery.data?.[0]?.updated_at ?? '0';
  const siteTs = sitesQuery.data?.[0]?.updated_at ?? '0';
  const version = tourTs > siteTs ? tourTs : siteTs;

  return NextResponse.json({ version });
}
