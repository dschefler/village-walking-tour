-- Optional acknowledgement sentence shown above the sponsor list on the
-- public Contact page (e.g. "We gratefully acknowledge our donors for
-- their generous support..."). Not yet applied to the live database —
-- run manually in the Supabase SQL editor.

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS sponsor_message TEXT;
