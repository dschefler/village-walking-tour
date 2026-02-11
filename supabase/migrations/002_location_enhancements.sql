-- Migration: Location Enhancements
-- Adds address fields to sites, contact submissions, donations, and notification preferences

-- =====================================================
-- PHASE 1: Enhance sites table with address fields
-- =====================================================

ALTER TABLE sites
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS address_formatted TEXT,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_sites_slug ON sites(slug);
CREATE INDEX IF NOT EXISTS idx_sites_is_published ON sites(is_published);

-- =====================================================
-- PHASE 2: Contact Submissions table
-- =====================================================

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger
CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for listing
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

-- =====================================================
-- PHASE 3: Donations table
-- =====================================================

CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency VARCHAR(3) DEFAULT 'GBP',
  payment_provider VARCHAR(50) NOT NULL CHECK (payment_provider IN ('stripe', 'paypal')),
  payment_intent_id VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded')),
  donor_name VARCHAR(255),
  donor_email VARCHAR(255),
  message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger
CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for lookups
CREATE INDEX IF NOT EXISTS idx_donations_payment_intent ON donations(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_donations_payment_status ON donations(payment_status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);

-- =====================================================
-- PHASE 4: Notification Preferences table
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id VARCHAR(255) NOT NULL UNIQUE,
  push_enabled BOOLEAN DEFAULT FALSE,
  proximity_enabled BOOLEAN DEFAULT TRUE,
  proximity_radius_meters INTEGER DEFAULT 100 CHECK (proximity_radius_meters >= 10 AND proximity_radius_meters <= 1000),
  dismissed_site_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for device lookups
CREATE INDEX IF NOT EXISTS idx_notification_preferences_device ON notification_preferences(device_id);

-- =====================================================
-- PHASE 5: Row Level Security
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Contact submissions: Public can insert, admins can manage
CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view contact submissions"
  ON contact_submissions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('admin', 'editor')
  ));

CREATE POLICY "Admins can manage contact submissions"
  ON contact_submissions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
  ));

-- Donations: Public can insert (via payment processing), admins can view all
CREATE POLICY "Payment webhooks can insert donations"
  ON donations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view donations"
  ON donations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
  ));

CREATE POLICY "Admins can manage donations"
  ON donations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
  ));

-- Notification preferences: Device-based access (no auth required for PWA)
CREATE POLICY "Anyone can manage their notification preferences"
  ON notification_preferences FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- PHASE 6: Update sites policies for is_published
-- =====================================================

-- Add policy for public to view published individual sites
CREATE POLICY "Public can view published sites"
  ON sites FOR SELECT
  USING (
    is_published = true
    OR EXISTS (
      SELECT 1 FROM tours WHERE tours.id = sites.tour_id AND tours.is_published = true
    )
  );

-- =====================================================
-- PHASE 7: Helper function for generating slugs
-- =====================================================

CREATE OR REPLACE FUNCTION generate_site_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug VARCHAR(255);
  new_slug VARCHAR(255);
  counter INTEGER := 0;
BEGIN
  -- Only generate if slug is null
  IF NEW.slug IS NULL THEN
    -- Create base slug from name
    base_slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := TRIM(BOTH '-' FROM base_slug);
    new_slug := base_slug;

    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (SELECT 1 FROM sites WHERE slug = new_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      new_slug := base_slug || '-' || counter;
    END LOOP;

    NEW.slug := new_slug;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply slug generation trigger
DROP TRIGGER IF EXISTS generate_site_slug_trigger ON sites;
CREATE TRIGGER generate_site_slug_trigger
  BEFORE INSERT OR UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION generate_site_slug();

-- Generate slugs for existing sites that don't have one
UPDATE sites
SET slug = NULL
WHERE slug IS NULL;
