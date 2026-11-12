import type { SupabaseClient } from '@supabase/supabase-js';
import { siteCategoryKeys } from '@/lib/site-categories';

type CuratedTourRow = { category?: string | null; site_names: string[] };

/**
 * For curated tours linked to a category, replace site_names with the names of
 * every published site in that category, so the tour picks up newly tagged
 * stops without being edited. Tours without a category are returned as-is.
 */
export async function withCategorySites<T extends CuratedTourRow>(
  supabase: SupabaseClient,
  organizationId: string,
  tours: T[]
): Promise<T[]> {
  if (!tours.some((t) => t.category)) return tours;

  const { data: sites } = await supabase
    .from('sites')
    .select('name, category, categories')
    .eq('organization_id', organizationId)
    .eq('is_published', true)
    .order('display_order');

  return tours.map((tour) =>
    tour.category
      ? { ...tour, site_names: (sites ?? []).filter((s) => siteCategoryKeys(s).includes(tour.category as never)).map((s) => s.name) }
      : tour
  );
}
