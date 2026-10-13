-- The pricing page promises a 7-day free trial, but the organizations
-- table default (migration 005) was still 14 days. The actual signup API
-- (src/app/api/organizations/route.ts) now sets trial_ends_at explicitly
-- on every insert, so this column default is only a fallback for any row
-- created outside that path. Not yet applied to the live database — this
-- environment has no direct Postgres connection, only the REST API, so
-- run this manually in the Supabase SQL editor if you want the column
-- default itself corrected too.

ALTER TABLE organizations
  ALTER COLUMN trial_ends_at SET DEFAULT (NOW() + INTERVAL '7 days');
