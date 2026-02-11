-- Migration: Security Fixes
-- Addresses Supabase security advisor warnings

-- =====================================================
-- PHASE 1: Ensure RLS is enabled on all tables
-- =====================================================

ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PHASE 2: Fix function security (add search_path)
-- =====================================================

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix handle_new_user function (needs SECURITY DEFINER to access auth.users)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'viewer');
  RETURN NEW;
END;
$$;

-- Fix generate_site_slug function
CREATE OR REPLACE FUNCTION generate_site_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
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
    WHILE EXISTS (SELECT 1 FROM public.sites WHERE slug = new_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      new_slug := base_slug || '-' || counter;
    END LOOP;

    NEW.slug := new_slug;
  END IF;

  RETURN NEW;
END;
$$;

-- =====================================================
-- PHASE 3: Fix contact_submissions RLS policies
-- Drop conflicting policies and recreate clean ones
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
DROP POLICY IF EXISTS "Admins can view contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admins can manage contact submissions" ON contact_submissions;

-- Recreate with clear separation
CREATE POLICY "contact_submissions_insert_public"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "contact_submissions_select_admin"
  ON contact_submissions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('admin', 'editor')
  ));

CREATE POLICY "contact_submissions_update_admin"
  ON contact_submissions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  ));

CREATE POLICY "contact_submissions_delete_admin"
  ON contact_submissions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  ));

-- =====================================================
-- PHASE 4: Fix sites RLS policy conflict
-- =====================================================

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "Public can view sites of published tours" ON sites;
DROP POLICY IF EXISTS "Public can view published sites" ON sites;

-- Create single unified policy for public site access
CREATE POLICY "sites_select_public"
  ON sites FOR SELECT
  USING (
    is_published = true
    OR EXISTS (
      SELECT 1 FROM tours
      WHERE tours.id = sites.tour_id
      AND tours.is_published = true
    )
  );
