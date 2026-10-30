-- Photo shape for the About page grid: landscape (4:3), portrait (3:4), square, or original (uncropped)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS about_gallery_layout TEXT NOT NULL DEFAULT 'original';
