-- Add theme customization fields to organizations
ALTER TABLE organizations
  ADD COLUMN theme_mode VARCHAR(10) DEFAULT 'light' CHECK (theme_mode IN ('light', 'dark')),
  ADD COLUMN font_family VARCHAR(100) DEFAULT 'Inter',
  ADD COLUMN background_color VARCHAR(7) DEFAULT '#FFFFFF',
  ADD COLUMN text_color VARCHAR(7) DEFAULT '#111827';
