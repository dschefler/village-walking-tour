import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  const host = headers().get('host') || '';
  const isWTB = host.includes('walkingtourbuilder.com');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/admin/'],
    },
    sitemap: isWTB
      ? 'https://walkingtourbuilder.com/sitemap.xml'
      : 'https://southamptonwalkingtour.com/sitemap.xml',
  };
}
