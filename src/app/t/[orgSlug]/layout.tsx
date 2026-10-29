import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TenantProvider } from '@/lib/context/tenant-context';
import { hexToHsl, getContrastColor } from '@/lib/color-utils';
import { ContentVersionChecker } from '@/components/pwa/ContentVersionChecker';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { UpdatePrompt } from '@/components/pwa/UpdatePrompt';
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

// Nothing previously read subscription_status/trial_ends_at anywhere in
// the app — the Stripe webhook already kept subscription_status current
// in real time (trialing/active/past_due/canceled/unpaid), but no page
// ever acted on it, so a lapsed subscription never actually took the
// public tour down. Two independent expiry paths to cover:
//  1. A paid subscription whose payment failed or was canceled.
//  2. A self-serve signup that never went through Stripe at all — those
//     orgs start as subscription_status='trialing' with trial_ends_at
//     defaulting to 14 days out (see migration 005), and nothing ever
//     flips their status once that clock runs out.
// Checking trial_ends_at against the current time on every request means
// this needs no cron job and no manual monitoring — it's current by
// definition on each page load.
function isAccessExpired(org: Organization): boolean {
  if (['canceled', 'past_due', 'unpaid'].includes(org.subscription_status)) {
    return true;
  }
  if (org.subscription_status === 'trialing' && org.trial_ends_at) {
    return new Date(org.trial_ends_at).getTime() < Date.now();
  }
  return false;
}

export async function generateMetadata({ params }: { params: { orgSlug: string } }) {
  const org = await getOrganization(params.orgSlug);
  if (!org) return {};

  const title = org.seo_title || org.app_name || org.name;
  const description = org.seo_description || org.app_description || `Explore ${org.name}`;
  const ogImage = org.logo_url ? [{ url: org.logo_url, alt: org.name }] : undefined;

  return {
    // `absolute` bypasses the root layout's title template
    // ('%s | Southampton Village Walking Tour') — without it, every
    // tenant's title silently got Southampton's name appended.
    title: { absolute: title },
    description,
    keywords: org.seo_keywords || undefined,
    manifest: `/api/manifest/${org.slug}`,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: org.app_short_name || org.name,
    },
    openGraph: {
      type: 'website',
      siteName: org.app_name || org.name,
      title,
      description,
      images: ogImage,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: org.logo_url ? [org.logo_url] : undefined,
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

  if (isAccessExpired(org)) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          This tour is currently unavailable
        </h1>
        <p style={{ color: '#6b7280', maxWidth: '28rem' }}>
          {org.name} isn&apos;t active right now. If you&apos;re the owner, sign in to your
          dashboard to reactivate it.
        </p>
      </div>
    );
  }

  const themeCSS = buildThemeCSS(org);
  const fontUrl = getGoogleFontUrl(org.font_family);
  const fontFamily = org.font_family || 'Inter';
  const headingFont = org.heading_font_family && org.heading_font_family !== fontFamily ? org.heading_font_family : null;
  const headingFontUrl = headingFont ? getGoogleFontUrl(headingFont) : null;
  const isDark = (org.theme_mode || 'light') === 'dark';

  return (
    <TenantProvider organization={org}>
      {fontUrl && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link rel="stylesheet" href={fontUrl} />
      )}
      {headingFontUrl && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link rel="stylesheet" href={headingFontUrl} />
      )}
      {headingFont && (
        <style
          dangerouslySetInnerHTML={{
            __html: `.tenant-theme :is(h1, h2, h3, h4, h5, h6) { font-family: "${headingFont.replace(/[^\w\s-]/g, '')}", Georgia, serif; }`,
          }}
        />
      )}
      <style
        dangerouslySetInnerHTML={{ __html: themeCSS }}
      />
      <ContentVersionChecker orgSlug={params.orgSlug} />
      <UpdatePrompt />
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
