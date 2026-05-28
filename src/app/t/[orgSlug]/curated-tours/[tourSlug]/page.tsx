import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CuratedTourClient } from './CuratedTourClient';
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

  return data as OrgCuratedTour | null;
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
