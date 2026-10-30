-- Optional photo grid on the tenant About page (up to 12 images)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS about_gallery JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS about_gallery_title TEXT;
