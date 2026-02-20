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
  // southamptonwalkingtour.com serves the (public) homepage directly
  // (no rewrite needed — falls through to (public)/page.tsx)

  // --- Protect /admin routes (legacy) ---
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'editor'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/', request.url));
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
