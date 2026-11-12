-- A curated tour can be linked to a location category: its stops are then every
-- published location in that category (kept current automatically) instead of
-- the hand-picked site_names list.
ALTER TABLE org_curated_tours ADD COLUMN IF NOT EXISTS category TEXT;
