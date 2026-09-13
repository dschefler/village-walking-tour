-- Migration: Marketing leads capture
-- Backs the "Get Started" email-capture modal (TrialCTA) on
-- walkingtourbuilder.com — /api/marketing/leads inserts here, and
-- /api/marketing/leads/export reads it back out as a CSV for the admin.

create table if not exists marketing_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'trial_cta',
  plan text,
  created_at timestamptz not null default now()
);

create index if not exists marketing_leads_created_at_idx on marketing_leads (created_at desc);

alter table marketing_leads enable row level security;

-- No public policies — only the service-role key (used server-side in the
-- API routes above) can read or write this table.
