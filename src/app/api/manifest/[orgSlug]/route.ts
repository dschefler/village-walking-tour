import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: { orgSlug: string } }
) {
  const supabase = createClient();
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', params.orgSlug)
    .eq('is_active', true)
    .single();

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  const manifest = {
    name: org.app_name || org.name,
    short_name: org.app_short_name || org.name.slice(0, 12),
    description: org.app_description || `Explore ${org.name}`,
    start_url: `/t/${org.slug}`,
    scope: `/t/${org.slug}`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: org.primary_color || '#3B82F6',
    orientation: 'portrait',
    icons: [
      {
        src: org.icon_url || '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: org.icon_url || '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: org.icon_url || '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
