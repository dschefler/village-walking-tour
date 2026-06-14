import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const WTB = 'https://walkingtourbuilder.com';
const SWT = 'https://southamptonwalkingtour.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = headers().get('host') || '';
  const isWTB = host.includes('walkingtourbuilder.com');

  if (isWTB) {
    return [
      { url: WTB,              lastModified: new Date(), changeFrequency: 'weekly',  priority: 1   },
      { url: `${WTB}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
      { url: `${WTB}/signup`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
      { url: `${WTB}/privacy`, lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
      { url: `${WTB}/terms`,   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    ];
  }

  const pages: MetadataRoute.Sitemap = [
    { url: SWT,                          lastModified: new Date(), changeFrequency: 'monthly', priority: 1   },
    { url: `${SWT}/historic-sites`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SWT}/curated-tours`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SWT}/create-your-tour`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SWT}/how-to-use`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SWT}/about`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SWT}/contact`,             lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${SWT}/privacy`,             lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SWT}/terms`,               lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ];

  // Add a page for every published Southampton historic site so Google can
  // index each landmark (e.g. /t/southampton/location/<slug>).
  try {
    const supabase = createClient();
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', 'southampton')
      .single();

    if (org) {
      const { data: sites } = await supabase
        .from('sites')
        .select('id, slug, updated_at')
        .eq('organization_id', org.id)
        .eq('is_published', true);

      for (const s of sites || []) {
        pages.push({
          url: `${SWT}/t/southampton/location/${s.slug || s.id}`,
          lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    }
  } catch {
    // If the lookup fails, still return the static pages above.
  }

  return pages;
}
