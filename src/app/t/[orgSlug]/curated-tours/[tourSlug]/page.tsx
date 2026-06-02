import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CuratedTourClient } from './CuratedTourClient';
import { CURATED_TOURS } from '@/lib/curated-tours';
import type { OrgCuratedTour } from '@/types';

async function getTour(orgSlug: string, tourSlug: string): Promise<OrgCuratedTour | null> {
  const supabase = createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('id, curated_tours_enabled')
    .eq('slug', orgSlug)
    .single();

  if (!org || !org.curated_tours_enabled) return null;

  const { data } = await supabase
    .from('org_curated_tours')
    .select('*')
    .eq('organization_id', org.id)
    .eq('slug', tourSlug)
    .single();

  if (data) return data as OrgCuratedTour;

  // Fall back to hardcoded tours (used by Southampton and any org without DB records)
  const hardcoded = CURATED_TOURS.find((t) => t.slug === tourSlug);
  if (!hardcoded) return null;

  return {
    id: hardcoded.slug,
    organization_id: org.id,
    name: hardcoded.name,
    slug: hardcoded.slug,
    tagline: hardcoded.tagline,
    description: hardcoded.description,
    time_estimate: '',
    site_names: hardcoded.locations,
    display_order: 0,
    created_at: '',
    updated_at: '',
  };
}

export default async function CuratedTourDetailPage({
  params,
}: {
  params: { orgSlug: string; tourSlug: string };
}) {
  const tour = await getTour(params.orgSlug, params.tourSlug);
  if (!tour) notFound();

  return <CuratedTourClient orgSlug={params.orgSlug} tour={tour} />;
}
