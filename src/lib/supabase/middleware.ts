import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const hostname = request.headers.get('host') || '';

  // --- Handle auth callback code on any URL ---
  const code = request.nextUrl.searchParams.get('code');
  if (code && pathname === '/') {
    const callbackUrl = new URL('/auth/callback', request.url);
    callbackUrl.searchParams.set('code', code);
    callbackUrl.searchParams.set('next', '/dashboard/onboarding');
    return NextResponse.redirect(callbackUrl);
  }

  // --- Custom domain routing ---
  // southamptonwalkingtour.com → falls through to (public)/page.tsx (no rewrite)
  // walkingtourbuilder.com → serves the marketing/product page
  const isWTBDomain = hostname.includes('walkingtourbuilder.com') || hostname.includes('village-walking-tour.vercel.app');
  const isSouthamptonDomain = hostname.includes('southamptonwalkingtour.com');

  if (isWTBDomain && pathname === '/') {
    return NextResponse.rewrite(new URL('/product', request.url));
  }

  // --- /admin/tours/[id]/edit is the per-tour editor (cover image, sites,
  // audio) — real customers need it too, on walkingtourbuilder.com, not
  // just the Southampton operator. The rest of /admin (marketing, media
  // library, usage, tours list/new) stays operator-only. Ownership of the
  // *specific* tour is checked by the page/API itself via organization_id.
  const isAdminTourEditor = /^\/admin\/tours\/[^/]+\/edit/.test(pathname);

  if (isWTBDomain && pathname.startsWith('/admin') && !isAdminTourEditor) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // --- Protect /admin routes (legacy) ---
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminTourEditor) {
      // Any org member may reach the editor — which tour they can
      // actually load/save is enforced downstream, not here.
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!membership) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (!profile || !['admin', 'editor'].includes(profile.role)) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    } else {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || !['admin', 'editor'].includes(profile.role)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // --- Protect /dashboard routes ---
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check user has at least one org membership
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    // If user has no org and isn't on the onboarding page, redirect to onboarding
    if (!membership && !pathname.startsWith('/dashboard/onboarding')) {
      return NextResponse.redirect(new URL('/dashboard/onboarding', request.url));
    }

    // Set org context headers for dashboard pages
    if (membership) {
      response.headers.set('x-org-id', membership.organization_id);
      response.headers.set('x-org-role', membership.role);
    }
  }

  // --- Tenant routes /t/{orgSlug}/* — pass through (public) ---
  // No auth required; org resolution happens in the layout

  return response;
}
