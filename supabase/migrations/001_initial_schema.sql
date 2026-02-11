-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tours table
CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  estimated_time INTEGER, -- minutes
  distance_km DECIMAL(5,2),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sites table
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  audio_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media table
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('image', 'audio')),
  alt_text TEXT,
  caption TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for sites and media
CREATE TABLE site_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  UNIQUE(site_id, media_id)
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sites_tour_id ON sites(tour_id);
CREATE INDEX idx_sites_display_order ON sites(tour_id, display_order);
CREATE INDEX idx_site_media_site_id ON site_media(site_id);
CREATE INDEX idx_site_media_media_id ON site_media(media_id);
CREATE INDEX idx_tours_slug ON tours(slug);
CREATE INDEX idx_tours_published ON tours(is_published);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_tours_updated_at
  BEFORE UPDATE ON tours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Public read access for published tours
CREATE POLICY "Public can view published tours"
  ON tours FOR SELECT
  USING (is_published = true);

-- Public can view sites of published tours
CREATE POLICY "Public can view sites of published tours"
  ON sites FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tours WHERE tours.id = sites.tour_id AND tours.is_published = true
  ));

-- Public can view media of published tours
CREATE POLICY "Public can view media"
  ON media FOR SELECT
  USING (true);

CREATE POLICY "Public can view site media of published tours"
  ON site_media FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM sites
    JOIN tours ON tours.id = sites.tour_id
    WHERE sites.id = site_media.site_id AND tours.is_published = true
  ));

-- Admin/Editor full access policies
CREATE POLICY "Admins can do everything with tours"
  ON tours FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('admin', 'editor')
  ));

CREATE POLICY "Admins can do everything with sites"
  ON sites FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('admin', 'editor')
  ));

CREATE POLICY "Admins can do everything with media"
  ON media FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('admin', 'editor')
  ));

CREATE POLICY "Admins can do everything with site_media"
  ON site_media FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('admin', 'editor')
  ));

-- User profiles policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin'
  ));

CREATE POLICY "Admins can manage profiles"
  ON user_profiles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin'
  ));

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'viewer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Storage bucket policies (run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('tour-media', 'tour-media', true);
