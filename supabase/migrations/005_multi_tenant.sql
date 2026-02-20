-- Migration: Multi-Tenant SaaS Support
-- Adds organizations, org members, fun_facts, analytics_events tables
-- Adds organization_id to existing tables for tenant isolation
-- Rewrites RLS policies for multi-tenant access control

-- =====================================================
-- PHASE 1: Organizations table
-- =====================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  icon_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#1E40AF',
  app_name VARCHAR(255),
  app_short_name VARCHAR(50),
  app_description TEXT,
  default_lat DECIMAL(10, 8) DEFAULT 40.88430000,
  default_lng DECIMAL(11, 8) DEFAULT -72.38960000,
  default_zoom INTEGER DEFAULT 15,
  custom_domain VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 1,
  stripe_customer_id VARCHAR(255),
  subscription_tier VARCHAR(50) DEFAULT 'trial' CHECK (subscription_tier IN ('trial', 'starter', 'pro', 'enterprise')),
  subscription_status VARCHAR(50) DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_custom_domain ON organizations(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX idx_organizations_is_active ON organizations(is_active);

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PHASE 2: Organization members table
-- =====================================================

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'admin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);

-- =====================================================
-- PHASE 3: Fun facts table (replaces hardcoded data)
-- =====================================================

CREATE TABLE fun_facts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  fact_text TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fun_facts_site_id ON fun_facts(site_id);

-- =====================================================
-- PHASE 4: Analytics events table
-- =====================================================

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
  site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  session_id VARCHAR(255),
  device_type VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_org_id ON analytics_events(organization_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);

-- =====================================================
-- PHASE 5: Add organization_id to existing tables
-- =====================================================

ALTER TABLE tours ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE media ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_tours_org_id ON tours(organization_id);
CREATE INDEX IF NOT EXISTS idx_sites_org_id ON sites(organization_id);
CREATE INDEX IF NOT EXISTS idx_media_org_id ON media(organization_id);
CREATE INDEX IF NOT EXISTS idx_contact_org_id ON contact_submissions(organization_id);
CREATE INDEX IF NOT EXISTS idx_donations_org_id ON donations(organization_id);

-- =====================================================
-- PHASE 6: Add platform_role to user_profiles
-- =====================================================

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS platform_role VARCHAR(50) DEFAULT 'customer' CHECK (platform_role IN ('super_admin', 'customer'));

-- =====================================================
-- PHASE 7: Enable RLS on new tables
-- =====================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE fun_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PHASE 8: Helper function — check org membership
-- =====================================================

CREATE OR REPLACE FUNCTION is_org_member(org_id UUID, min_role TEXT DEFAULT 'editor')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $fn$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM organization_members
  WHERE organization_id = org_id
    AND user_id = auth.uid();

  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Role hierarchy: owner > admin > editor
  IF min_role = 'editor' THEN
    RETURN TRUE;
  ELSIF min_role = 'admin' THEN
    RETURN user_role IN ('admin', 'owner');
  ELSIF min_role = 'owner' THEN
    RETURN user_role = 'owner';
  END IF;

  RETURN FALSE;
END;
$fn$;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $fn$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND platform_role = 'super_admin'
  );
END;
$fn$;

-- =====================================================
-- PHASE 9: Drop old RLS policies
-- =====================================================

-- Tours
DROP POLICY IF EXISTS "Public can view published tours" ON tours;
DROP POLICY IF EXISTS "Admins can do everything with tours" ON tours;

-- Sites
DROP POLICY IF EXISTS "sites_select_public" ON sites;
DROP POLICY IF EXISTS "Admins can do everything with sites" ON sites;

-- Media
DROP POLICY IF EXISTS "Public can view media" ON media;
DROP POLICY IF EXISTS "Admins can do everything with media" ON media;

-- Site media
DROP POLICY IF EXISTS "Public can view site media of published tours" ON site_media;
DROP POLICY IF EXISTS "Admins can do everything with site_media" ON site_media;

-- Contact submissions
DROP POLICY IF EXISTS "contact_submissions_insert_public" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_select_admin" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_update_admin" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_delete_admin" ON contact_submissions;

-- Donations
DROP POLICY IF EXISTS "Payment webhooks can insert donations" ON donations;
DROP POLICY IF EXISTS "Admins can view donations" ON donations;
DROP POLICY IF EXISTS "Admins can manage donations" ON donations;

-- =====================================================
-- PHASE 10: New multi-tenant RLS policies
-- =====================================================

-- Organizations: public can read active orgs, members can manage their own
CREATE POLICY "orgs_select_public"
  ON organizations FOR SELECT
  USING (is_active = true);

CREATE POLICY "orgs_update_member"
  ON organizations FOR UPDATE
  USING (is_org_member(id, 'admin'));

CREATE POLICY "orgs_insert_authenticated"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Organization members: members can view their own org's members, owners can manage
CREATE POLICY "org_members_select"
  ON organization_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_org_member(organization_id, 'admin')
    OR is_super_admin()
  );

CREATE POLICY "org_members_insert"
  ON organization_members FOR INSERT
  WITH CHECK (
    is_org_member(organization_id, 'owner')
    OR is_super_admin()
    -- Allow self-insert when creating a new org (user becomes owner)
    OR (user_id = auth.uid() AND role = 'owner' AND NOT EXISTS (
      SELECT 1 FROM organization_members WHERE organization_id = organization_members.organization_id
    ))
  );

CREATE POLICY "org_members_update"
  ON organization_members FOR UPDATE
  USING (is_org_member(organization_id, 'owner') OR is_super_admin());

CREATE POLICY "org_members_delete"
  ON organization_members FOR DELETE
  USING (is_org_member(organization_id, 'owner') OR is_super_admin());

-- Tours: public reads published, org members manage their own
CREATE POLICY "tours_select_public"
  ON tours FOR SELECT
  USING (is_published = true);

CREATE POLICY "tours_select_member"
  ON tours FOR SELECT
  USING (is_org_member(organization_id, 'editor'));

CREATE POLICY "tours_insert_member"
  ON tours FOR INSERT
  WITH CHECK (is_org_member(organization_id, 'editor'));

CREATE POLICY "tours_update_member"
  ON tours FOR UPDATE
  USING (is_org_member(organization_id, 'editor'));

CREATE POLICY "tours_delete_member"
  ON tours FOR DELETE
  USING (is_org_member(organization_id, 'admin'));

-- Super admin can manage all tours
CREATE POLICY "tours_all_super_admin"
  ON tours FOR ALL
  USING (is_super_admin());

-- Sites: public reads sites of published tours, org members manage
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

CREATE POLICY "sites_select_member"
  ON sites FOR SELECT
  USING (is_org_member(organization_id, 'editor'));

CREATE POLICY "sites_insert_member"
  ON sites FOR INSERT
  WITH CHECK (is_org_member(organization_id, 'editor'));

CREATE POLICY "sites_update_member"
  ON sites FOR UPDATE
  USING (is_org_member(organization_id, 'editor'));

CREATE POLICY "sites_delete_member"
  ON sites FOR DELETE
  USING (is_org_member(organization_id, 'admin'));

CREATE POLICY "sites_all_super_admin"
  ON sites FOR ALL
  USING (is_super_admin());

-- Media: public reads all, org members manage their own
CREATE POLICY "media_select_public"
  ON media FOR SELECT
  USING (true);

CREATE POLICY "media_insert_member"
  ON media FOR INSERT
  WITH CHECK (is_org_member(organization_id, 'editor'));

CREATE POLICY "media_update_member"
  ON media FOR UPDATE
  USING (is_org_member(organization_id, 'editor'));

CREATE POLICY "media_delete_member"
  ON media FOR DELETE
  USING (is_org_member(organization_id, 'admin'));

CREATE POLICY "media_all_super_admin"
  ON media FOR ALL
  USING (is_super_admin());

-- Site media: follows site access patterns
CREATE POLICY "site_media_select_public"
  ON site_media FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM sites
    JOIN tours ON tours.id = sites.tour_id
    WHERE sites.id = site_media.site_id
    AND (sites.is_published = true OR tours.is_published = true)
  ));

CREATE POLICY "site_media_manage_member"
  ON site_media FOR ALL
  USING (EXISTS (
    SELECT 1 FROM sites
    WHERE sites.id = site_media.site_id
    AND is_org_member(sites.organization_id, 'editor')
  ));

-- Fun facts: public reads, org members manage via site's org
CREATE POLICY "fun_facts_select_public"
  ON fun_facts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM sites
    WHERE sites.id = fun_facts.site_id
    AND (sites.is_published = true OR EXISTS (
      SELECT 1 FROM tours WHERE tours.id = sites.tour_id AND tours.is_published = true
    ))
  ));

CREATE POLICY "fun_facts_manage_member"
  ON fun_facts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM sites
    WHERE sites.id = fun_facts.site_id
    AND is_org_member(sites.organization_id, 'editor')
  ));

-- Contact submissions: public inserts, org members view their own
CREATE POLICY "contact_insert_public"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "contact_select_member"
  ON contact_submissions FOR SELECT
  USING (is_org_member(organization_id, 'editor'));

CREATE POLICY "contact_manage_member"
  ON contact_submissions FOR UPDATE
  USING (is_org_member(organization_id, 'admin'));

CREATE POLICY "contact_delete_member"
  ON contact_submissions FOR DELETE
  USING (is_org_member(organization_id, 'admin'));

-- Donations: webhook inserts, org members view their own
CREATE POLICY "donations_insert_public"
  ON donations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "donations_select_member"
  ON donations FOR SELECT
  USING (is_org_member(organization_id, 'admin'));

CREATE POLICY "donations_manage_super_admin"
  ON donations FOR ALL
  USING (is_super_admin());

-- Analytics: insert from API, org members read their own
CREATE POLICY "analytics_insert_authenticated"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "analytics_select_member"
  ON analytics_events FOR SELECT
  USING (is_org_member(organization_id, 'admin'));

CREATE POLICY "analytics_all_super_admin"
  ON analytics_events FOR ALL
  USING (is_super_admin());

-- =====================================================
-- PHASE 11: Update handle_new_user to set platform_role
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  INSERT INTO public.user_profiles (id, email, role, platform_role)
  VALUES (NEW.id, NEW.email, 'viewer', 'customer');
  RETURN NEW;
END;
$fn$;
