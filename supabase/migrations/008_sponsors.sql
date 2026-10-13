-- Sponsor acknowledgement list, shown in the right column of the public
-- Contact page. Array of { name, logo_url, url }. Not yet applied to the
-- live database — this environment has no direct Postgres connection,
-- only the REST API, so run this manually in the Supabase SQL editor.

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS sponsors JSONB DEFAULT '[]'::jsonb;
