-- Migration: Add Rogers Memorial Library as the first historic site
-- This migration creates the Southampton Walking Tour and adds Rogers Memorial Library

-- =====================================================
-- STEP 1: Create the Southampton Walking Tour
-- =====================================================

INSERT INTO tours (id, name, slug, description, is_published, created_at, updated_at)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Southampton Village Walking Tour',
  'southampton-village',
  'Explore the rich history and hidden stories of Southampton Village through this self-guided walking tour.',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- STEP 2: Add Rogers Memorial Library
-- =====================================================

INSERT INTO sites (
  id,
  tour_id,
  name,
  slug,
  description,
  address,
  latitude,
  longitude,
  is_published,
  display_order,
  created_at,
  updated_at
)
VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Rogers Memorial Library',
  'rogers-memorial-library',
  'Rogers Memorial Library is a beloved public library serving the educational, cultural, and lifelong learning needs of the Southampton and Tuckahoe School District communities. Founded in 1893 through a bequest by Harriet Jones Rogers, the library has evolved from its original Victorian Gothic building into a modern community hub at 91 Coopers Farm Road offering books, digital resources, local history collections, programs for all ages, and a variety of services to visitors. It''s a cornerstone for learning, connection, and community engagement in the area.',
  '91 Coopers Farm Road, Southampton, NY 11968',
  40.88621,
  -72.39332,
  true,
  1,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  address = EXCLUDED.address,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();

-- =====================================================
-- STEP 3: Add media entry for the library image
-- (Image should be uploaded to Supabase storage bucket 'tour-media')
-- =====================================================

INSERT INTO media (
  id,
  filename,
  storage_path,
  file_type,
  alt_text,
  caption,
  created_at
)
VALUES (
  'c3d4e5f6-a7b8-9012-cdef-345678901234',
  'rogers-memorial-library.webp',
  'sites/rogers-memorial-library.webp',
  'image',
  'Rogers Memorial Library building in Southampton Village',
  'Rogers Memorial Library - Founded in 1893',
  NOW()
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 4: Link media to site
-- =====================================================

INSERT INTO site_media (
  id,
  site_id,
  media_id,
  display_order,
  is_primary
)
VALUES (
  'd4e5f6a7-b8c9-0123-def4-567890123456',
  'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  'c3d4e5f6-a7b8-9012-cdef-345678901234',
  1,
  true
)
ON CONFLICT (site_id, media_id) DO NOTHING;
