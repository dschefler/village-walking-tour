import type { SupabaseClient } from '@supabase/supabase-js';

export interface RequesterMembership {
  organization_id: string;
  role: string;
}

/**
 * Derives the authenticated user's organization membership server-side.
 *
 * Every API route or page that mutates/reads org-scoped data (tours, sites,
 * media, etc.) must call this and filter queries by the returned
 * organization_id — never trust an organization_id / orgId supplied by the
 * client (query param, request body, or the id of some other resource) as
 * the basis for authorization. Doing so is how a logged-in customer of one
 * org can read or write another org's data.
 */
export async function getRequesterMembership(
  supabase: SupabaseClient,
  userId: string
): Promise<RequesterMembership | null> {
  const { data } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', userId)
    .limit(1)
    .single();

  return data ?? null;
}
