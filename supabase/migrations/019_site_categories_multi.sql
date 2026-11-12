-- Locations can belong to several categories. `categories` holds all of them
-- in the order picked; `category` stays as the first (primary) one, which sets
-- the map pin's icon. Backfill from the existing single category.
ALTER TABLE sites ADD COLUMN IF NOT EXISTS categories TEXT[] NOT NULL DEFAULT '{}';
UPDATE sites SET categories = ARRAY[category]
  WHERE category IS NOT NULL AND categories = '{}';
