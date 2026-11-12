import { createClient } from '@/lib/supabase/server';
import { SITE_CATEGORIES, normalizeCategory, type SiteCategory } from '@/lib/site-categories';

/** Published-site count per category for an org, plus the total; categories with no sites are left out */
export async function getOrgCategoryCounts(orgId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('sites')
    .select('category')
    .eq('organization_id', orgId)
    .eq('is_published', true);

  const counts = new Map<SiteCategory, number>();
  for (const row of data ?? []) {
    const key = normalizeCategory(row.category);
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return {
    total: data?.length ?? 0,
    categories: SITE_CATEGORIES.filter((c) => counts.has(c.key)).map((c) => ({ ...c, count: counts.get(c.key)! })),
  };
}
