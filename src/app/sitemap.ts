import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

const WTB = 'https://walkingtourbuilder.com';
const SWT = 'https://southamptonwalkingtour.com';

export default function sitemap(): MetadataRoute.Sitemap {
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

  return [
    { url: SWT,                          lastModified: new Date(), changeFrequency: 'monthly', priority: 1   },
    { url: `${SWT}/create-your-tour`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SWT}/privacy`,             lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SWT}/terms`,               lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
