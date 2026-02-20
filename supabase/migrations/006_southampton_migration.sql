-- Migration: Southampton tenant setup
-- Creates the Southampton organization and backfills existing data

-- =====================================================
-- STEP 1: Create Southampton organization
-- =====================================================

INSERT INTO organizations (
  id,
  name,
  slug,
  primary_color,
  secondary_color,
  app_name,
  app_short_name,
  app_description,
  default_lat,
  default_lng,
  default_zoom,
  is_active,
  onboarding_completed,
  subscription_tier,
  subscription_status,
  trial_ends_at
)
VALUES (
  'e1f2a3b4-c5d6-7890-abcd-ef1234500001',
  'Southampton Village Walking Tour',
  'southampton',
  '#3B82F6',
  '#1E40AF',
  'Southampton Village Walking Tour',
  'SH Tour',
  'Explore the rich history and hidden stories of Southampton Village through this self-guided walking tour.',
  40.88430000,
  -72.38960000,
  15,
  true,
  true,
  'pro',
  'active',
  NULL
)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- STEP 2: Backfill organization_id on existing data
-- =====================================================

UPDATE tours
SET organization_id = 'e1f2a3b4-c5d6-7890-abcd-ef1234500001'
WHERE organization_id IS NULL;

UPDATE sites
SET organization_id = 'e1f2a3b4-c5d6-7890-abcd-ef1234500001'
WHERE organization_id IS NULL;

UPDATE media
SET organization_id = 'e1f2a3b4-c5d6-7890-abcd-ef1234500001'
WHERE organization_id IS NULL;

UPDATE contact_submissions
SET organization_id = 'e1f2a3b4-c5d6-7890-abcd-ef1234500001'
WHERE organization_id IS NULL;

UPDATE donations
SET organization_id = 'e1f2a3b4-c5d6-7890-abcd-ef1234500001'
WHERE organization_id IS NULL;

-- =====================================================
-- STEP 3: Migrate fun facts from hardcoded data to DB
-- (Uses the Rogers Memorial Library site ID from 004)
-- =====================================================

-- Rogers Memorial Library facts
INSERT INTO fun_facts (site_id, fact_text, display_order) VALUES
  ('b2c3d4e5-f6a7-8901-bcde-f23456789012', 'Harriet Jones Rogers left just $10,000 and a plot of land in 1892 to build a free library — she''d never even lived in Southampton.', 1),
  ('b2c3d4e5-f6a7-8901-bcde-f23456789012', 'The original 1895 building on Job''s Lane had room for 20,000 books and an upstairs apartment for the caretaker.', 2),
  ('b2c3d4e5-f6a7-8901-bcde-f23456789012', 'One of the library''s first book donations — 400 volumes — came from William Pelletreau, whose family''s silver shop is also on this tour.', 3),
  ('b2c3d4e5-f6a7-8901-bcde-f23456789012', 'The new building opened in 2000 at 91 Coopers Farm Road — over 100 years after the original, and 10 times the size.', 4);

-- Note: Fun facts for other sites (WWI Memorial, Museum, Pelletreau, Halsey House)
-- will be inserted once those sites are created in the DB with their own UUIDs.
-- The hardcoded fun-facts.ts file will remain as a fallback until all sites are migrated.

-- =====================================================
-- STEP 4: Link existing admin user as org owner
-- This should be run manually after identifying the admin user ID:
--
--   INSERT INTO organization_members (organization_id, user_id, role)
--   SELECT 'e1f2a3b4-c5d6-7890-abcd-ef1234500001', id, 'owner'
--   FROM user_profiles
--   WHERE role = 'admin'
--   LIMIT 1;
--
--   UPDATE user_profiles
--   SET platform_role = 'super_admin'
--   WHERE role = 'admin';
-- =====================================================

-- Auto-link: Make all existing admin users owners of Southampton
INSERT INTO organization_members (organization_id, user_id, role)
SELECT 'e1f2a3b4-c5d6-7890-abcd-ef1234500001', id, 'owner'
FROM user_profiles
WHERE role = 'admin'
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Promote existing admins to super_admin platform role
UPDATE user_profiles
SET platform_role = 'super_admin'
WHERE role = 'admin';
