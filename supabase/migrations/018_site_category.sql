-- What kind of stop a location is (historic building, public art, parking, …).
-- Drives the marker color/icon, a category tag, and the Historic Sites filter.
-- Keys are defined in src/lib/site-categories.ts; NULL = uncategorized.
ALTER TABLE sites ADD COLUMN IF NOT EXISTS category TEXT;
