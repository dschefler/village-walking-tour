-- Optional separate font for headings (NULL = use font_family)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS heading_font_family TEXT;
