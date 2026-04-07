-- Migration: Enable RLS on tables that are missing it
-- Addresses Supabase Security Advisor warnings:
--   - "Policy Exists RLS Disabled" on user_profiles
--   - "RLS Disabled in Public" on user_profiles and checkout_sessions

-- user_profiles: RLS policies already exist (from migration 001) but the
-- RLS toggle was not active on the live database. Enabling it activates
-- the existing policies (users see only their own profile; admins see all).
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- checkout_sessions: holds Stripe session data. All access goes through
-- the service role key in server-side API routes, which bypasses RLS.
-- No anon/authenticated client policies are needed.
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;
