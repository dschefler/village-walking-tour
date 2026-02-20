export interface Tour {
  id: string;
  organization_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  estimated_time: number | null; // minutes
  distance_km: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  tour_id: string;
  organization_id: string | null;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  audio_url: string | null;
  display_order: number;
  address: string | null;
  address_formatted: string | null;
  is_published: boolean;
  slug: string | null;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: string;
  filename: string;
  storage_path: string;
  file_type: 'image' | 'audio';
  alt_text: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
  created_at: string;
}

export interface SiteMedia {
  id: string;
  site_id: string;
  media_id: string;
  display_order: number;
  is_primary: boolean;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  platform_role: 'super_admin' | 'customer';
  created_at: string;
}

// Extended types with relations
export interface SiteWithMedia extends Site {
  media: (Media & { is_primary: boolean; display_order: number })[];
}

export interface TourWithSites extends Tour {
  sites: SiteWithMedia[];
}

// GPS/Navigation types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface NavigationState {
  userLocation: Coordinates | null;
  heading: number | null;
  accuracy: number | null;
  isTracking: boolean;
  error: string | null;
}

export interface SiteDistance {
  siteId: string;
  distance: number; // meters
  bearing: number; // degrees
}

// Audio player types
export interface AudioState {
  isPlaying: boolean;
  currentSiteId: string | null;
  progress: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
}

// Tour progress types
export interface TourProgress {
  tourId: string;
  visitedSites: string[];
  currentSiteId: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

// Offline sync types
export interface SyncStatus {
  lastSynced: string | null;
  pendingChanges: number;
  isOnline: boolean;
  isSyncing: boolean;
}

// Contact form types
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: 'pending' | 'read' | 'replied' | 'archived';
  created_at: string;
  updated_at: string;
}

// Donation types
export interface Donation {
  id: string;
  amount_cents: number;
  currency: string;
  payment_provider: 'stripe' | 'paypal';
  payment_intent_id: string | null;
  payment_status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
  donor_name: string | null;
  donor_email: string | null;
  message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Notification preferences types
export interface NotificationPreferences {
  id: string;
  device_id: string;
  push_enabled: boolean;
  proximity_enabled: boolean;
  proximity_radius_meters: number;
  dismissed_site_ids: string[];
  created_at: string;
  updated_at: string;
}

// Proximity alert types
export interface ProximityAlert {
  siteId: string;
  siteName: string;
  distance: number;
  timestamp: string;
  audioUrl?: string | null;
  transcript?: string | null; // Description/transcript for accessibility
}

// Organization / multi-tenant types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  icon_url: string | null;
  primary_color: string;
  secondary_color: string;
  theme_mode: 'light' | 'dark';
  font_family: string;
  background_color: string;
  text_color: string;
  app_name: string | null;
  app_short_name: string | null;
  app_description: string | null;
  default_lat: number;
  default_lng: number;
  default_zoom: number;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  custom_domain: string | null;
  is_active: boolean;
  onboarding_completed: boolean;
  onboarding_step: number;
  stripe_customer_id: string | null;
  subscription_tier: 'trial' | 'starter' | 'pro' | 'enterprise';
  subscription_status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor';
  created_at: string;
}

export interface FunFact {
  id: string;
  site_id: string;
  fact_text: string;
  display_order: number;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  organization_id: string;
  tour_id: string | null;
  site_id: string | null;
  event_type: string;
  session_id: string | null;
  device_type: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
