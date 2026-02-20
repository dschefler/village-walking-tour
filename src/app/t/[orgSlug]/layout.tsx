import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TenantProvider } from '@/lib/context/tenant-context';
import { hexToHsl, getContrastColor } from '@/lib/color-utils';
import type { Organization } from '@/types';

async function getOrganization(slug: string): Promise<Organization | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: { params: { orgSlug: string } }) {
  const org = await getOrganization(params.orgSlug);
  if (!org) return {};

  return {
    title: org.app_name || org.name,
    description: org.app_description || `Explore ${org.name}`,
    manifest: `/api/manifest/${org.slug}`,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: org.app_short_name || org.name,
    },
    openGraph: {
      type: 'website',
      siteName: org.app_name || org.name,
      title: org.app_name || org.name,
      description: org.app_description || `Explore ${org.name}`,
    },
  };
}

function buildThemeCSS(org: Organization): string {
  const primaryHsl = hexToHsl(org.primary_color);
  const secondaryHsl = hexToHsl(org.secondary_color);
  const bgHsl = hexToHsl(org.background_color || '#FFFFFF');
  const fgHsl = hexToHsl(org.text_color || '#111827');
  const primaryFg = hexToHsl(getContrastColor(org.primary_color));
  const secondaryFg = hexToHsl(getContrastColor(org.secondary_color));

  // Derive muted/card/border from background — slight adjustments
  const isDark = (org.theme_mode || 'light') === 'dark';
  const mutedHsl = isDark
    ? hexToHsl('#27273a')
    : hexToHsl('#f1f5f9');
  const mutedFgHsl = isDark
    ? hexToHsl('#94a3b8')
    : hexToHsl('#64748b');
  const borderHsl = isDark
    ? hexToHsl('#334155')
    : hexToHsl('#e2e8f0');

  // Also target [data-radix-portal] so dropdowns, dialogs, and popovers
  // (which render outside .tenant-theme via portals) use the tenant colors.
  const vars = `
      --primary: ${primaryHsl};
      --primary-foreground: ${primaryFg};
      --secondary: ${secondaryHsl};
      --secondary-foreground: ${secondaryFg};
      --background: ${bgHsl};
      --foreground: ${fgHsl};
      --card: ${bgHsl};
      --card-foreground: ${fgHsl};
      --popover: ${bgHsl};
      --popover-foreground: ${fgHsl};
      --muted: ${mutedHsl};
      --muted-foreground: ${mutedFgHsl};
      --border: ${borderHsl};
      --input: ${borderHsl};
      --ring: ${primaryHsl};
      --accent: ${mutedHsl};
      --accent-foreground: ${fgHsl};`;

  return `
    .tenant-theme { ${vars} }
    [data-radix-portal] { ${vars} }
  `;
}

function getGoogleFontUrl(fontFamily: string): string | null {
  if (!fontFamily || fontFamily === 'Inter') return null;
  const encoded = fontFamily.replace(/\s+/g, '+');
  return `https://fonts.googleapis.com/css2?family=${encoded}:wght@300;400;500;600;700&display=swap`;
}

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgSlug: string };
}) {
  const org = await getOrganization(params.orgSlug);

  if (!org) {
    notFound();
  }

  const themeCSS = buildThemeCSS(org);
  const fontUrl = getGoogleFontUrl(org.font_family);
  const fontFamily = org.font_family || 'Inter';
  const isDark = (org.theme_mode || 'light') === 'dark';

  return (
    <TenantProvider organization={org}>
      {fontUrl && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link rel="stylesheet" href={fontUrl} />
      )}
      <style
        dangerouslySetInnerHTML={{ __html: themeCSS }}
      />
      <div
        className={`tenant-theme ${isDark ? 'dark' : ''}`}
        style={{
          fontFamily: `"${fontFamily}", ui-sans-serif, system-ui, sans-serif`,
          backgroundColor: `hsl(var(--background))`,
          color: `hsl(var(--foreground))`,
          minHeight: '100dvh',
        }}
      >
        {children}
      </div>
    </TenantProvider>
  );
}
