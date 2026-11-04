-- Locations that are a neighborhood or area rather than one building:
-- shown with a "Neighborhood" tag, a shaded circle on the map, a "Start here"
-- address line, and arrival detection anywhere inside the circle.
ALTER TABLE sites ADD COLUMN IF NOT EXISTS is_area BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS area_radius_m INTEGER NOT NULL DEFAULT 150;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS start_point TEXT;
