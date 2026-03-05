-- Add per-organization donation settings
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS donations_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS donation_amounts JSONB NOT NULL DEFAULT '[5, 10, 20, 50]'::JSONB;

COMMENT ON COLUMN organizations.donations_enabled IS 'Whether the donations section is shown on the org contact page';
COMMENT ON COLUMN organizations.donation_amounts IS 'Preset donation amounts in dollars, e.g. [5, 10, 20, 50]';
