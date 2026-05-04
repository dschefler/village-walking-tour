import { notFound } from 'next/navigation';
import { getCuratedTour } from '@/lib/curated-tours';
import { CuratedTourClient } from './CuratedTourClient';

export default function CuratedTourDetailPage({
  params,
}: {
  params: { orgSlug: string; tourSlug: string };
}) {
  const tour = getCuratedTour(params.tourSlug);
  if (!tour) notFound();

  return <CuratedTourClient orgSlug={params.orgSlug} tour={tour!} />;
}
