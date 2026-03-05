-- Per-organization SEO metadata fields
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS seo_title VARCHAR(70),
  ADD COLUMN IF NOT EXISTS seo_description VARCHAR(160),
  ADD COLUMN IF NOT EXISTS seo_keywords VARCHAR(500);

COMMENT ON COLUMN organizations.seo_title IS 'Custom page title for search engines (50–70 chars recommended)';
COMMENT ON COLUMN organizations.seo_description IS 'Meta description shown in search results (150–160 chars recommended)';
COMMENT ON COLUMN organizations.seo_keywords IS 'Comma-separated keywords for search indexing';
