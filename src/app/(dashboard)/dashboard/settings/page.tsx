'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Loader2, Save, X, Sun, Moon, Mic, Heart, Plus, ExternalLink, Play, Square, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { useToast } from '@/hooks/use-toast';
import type { AboutGalleryLayout, AboutPhoto, Organization, Sponsor } from '@/types';

interface VoiceOption {
  id: string;
  name: string;
  description: string;
}

const ABOUT_PHOTO_LIMIT = 12;

const ABOUT_LAYOUTS: { value: AboutGalleryLayout; label: string; hint: string }[] = [
  { value: 'original', label: 'Original', hint: 'Whole image, no cropping' },
  { value: 'landscape', label: '4 × 3', hint: 'Wide, cropped to fit' },
  { value: 'portrait', label: '3 × 4', hint: 'Tall, cropped to fit' },
  { value: 'square', label: '1 × 1', hint: 'Square, cropped to fit' },
];

function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

const FONT_OPTIONS = [
  'Cormorant Garamond',
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Source Sans 3',
  'Playfair Display',
  'Merriweather',
  'Libre Baskerville',
  'DM Sans',
  'Nunito',
  'Raleway',
  'Work Sans',
  'Crimson Text',
];

function SubscriptionCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openPortal = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to open portal');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Subscription &amp; Billing
        </CardTitle>
        <CardDescription>
          Manage your plan, update payment details, or cancel your subscription. Monthly subscriptions can be cancelled any time — you keep access until the end of your current billing period. Annual subscriptions are eligible for a pro-rated refund within 30 days of renewal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" onClick={openPortal} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
          Manage Subscription
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">
          Opens the Stripe billing portal in a new page. You&apos;ll be returned here when done.
        </p>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ttsUsage, setTtsUsage] = useState<{ used: number; limit: number; tier: string } | null>(null);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [defaultTtsVoice, setDefaultTtsVoice] = useState<string>('');
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  const [previewPlayingId, setPreviewPlayingId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const [name, setName] = useState('');
  const [appName, setAppName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#1E40AF');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');

  // SEO fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // Feature flags
  const [curatedToursEnabled, setCuratedToursEnabled] = useState(true);

  // Donation fields
  const [donationsEnabled, setDonationsEnabled] = useState(false);
  const [donationAmounts, setDonationAmounts] = useState<number[]>([5, 10, 20, 50]);
  const [newAmount, setNewAmount] = useState('');

  // Sponsor acknowledgement list — shown in the right column of the
  // public Contact page
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [sponsorMessage, setSponsorMessage] = useState('');

  // Photo grid on the public About page (max ABOUT_PHOTO_LIMIT)
  const [aboutPhotos, setAboutPhotos] = useState<AboutPhoto[]>([]);
  const [aboutGalleryTitle, setAboutGalleryTitle] = useState('');
  const [aboutGalleryLayout, setAboutGalleryLayout] = useState<AboutGalleryLayout>('original');

  // Theme fields
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [fontFamily, setFontFamily] = useState('Open Sans');
  const [headingFont, setHeadingFont] = useState(''); // '' = same as body font
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [textColor, setTextColor] = useState('#111827');

  useEffect(() => {
    fetch('/api/tts/usage')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setTtsUsage(data); })
      .catch(() => {});
    fetch('/api/tts')
      .then((r) => r.ok ? r.json() : [])
      .then((data: VoiceOption[]) => setVoices(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/organizations');
        if (res.ok) {
          const orgs = await res.json();
          if (orgs.length > 0) {
            const o = orgs[0];
            setOrg(o);
            setName(o.name || '');
            setAppName(o.app_name || '');
            setDescription(o.app_description || '');
            setLogoUrl(o.logo_url || '');
            setPrimaryColor(o.primary_color || '#3B82F6');
            setSecondaryColor(o.secondary_color || '#1E40AF');
            setContactEmail(o.contact_email || '');
            setContactPhone(o.contact_phone || '');
            setContactAddress(o.contact_address || '');
            setSeoTitle(o.seo_title || '');
            setSeoDescription(o.seo_description || '');
            setSeoKeywords(o.seo_keywords || '');
            setCuratedToursEnabled(o.curated_tours_enabled ?? true);
            setDonationsEnabled(o.donations_enabled ?? false);
            setDonationAmounts(o.donation_amounts ?? [5, 10, 20, 50]);
            setSponsors(o.sponsors ?? []);
            setAboutPhotos(o.about_gallery ?? []);
            setAboutGalleryTitle(o.about_gallery_title || '');
            setAboutGalleryLayout(o.about_gallery_layout || 'original');
            setSponsorMessage(o.sponsor_message ?? '');
            setThemeMode(o.theme_mode || 'light');
            setFontFamily(o.font_family || 'Inter');
            setHeadingFont(o.heading_font_family || '');
            setBackgroundColor(o.background_color || '#FFFFFF');
            setTextColor(o.text_color || '#111827');
            setDefaultTtsVoice(o.default_tts_voice || '');
          }
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stopVoicePreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.src = '';
      previewAudioRef.current = null;
    }
    setPreviewPlayingId(null);
  };

  const handleVoicePreview = async (voiceId: string) => {
    if (previewPlayingId === voiceId) {
      stopVoicePreview();
      return;
    }
    stopVoicePreview();
    setPreviewLoadingId(voiceId);
    try {
      const res = await fetch(`/api/tts/preview/${voiceId}`);
      const data = await res.json();
      if (!res.ok || !data.url) return;
      const audio = new Audio(data.url);
      previewAudioRef.current = audio;
      setPreviewPlayingId(voiceId);
      audio.play().catch(() => {});
      audio.onended = () => setPreviewPlayingId(null);
      audio.onerror = () => setPreviewPlayingId(null);
    } finally {
      setPreviewLoadingId(null);
    }
  };

  const addSponsor = () => {
    setSponsors((prev) => [...prev, { name: '', logo_url: null, url: null }]);
  };

  const updateSponsor = (index: number, patch: Partial<Sponsor>) => {
    setSponsors((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const removeSponsor = (index: number) => {
    setSponsors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleThemeModeToggle = (mode: 'light' | 'dark') => {
    setThemeMode(mode);
    if (mode === 'dark') {
      setBackgroundColor('#1a1a2e');
      setTextColor('#f1f1f1');
    } else {
      setBackgroundColor('#FFFFFF');
      setTextColor('#111827');
    }
  };

  const handleSave = async () => {
    if (!org) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/organizations/${org.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          logo_url: logoUrl || null,
          app_name: appName,
          app_description: description,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          contact_email: contactEmail || null,
          contact_phone: contactPhone || null,
          contact_address: contactAddress || null,
          seo_title: seoTitle.trim() || null,
          seo_description: seoDescription.trim() || null,
          seo_keywords: seoKeywords.trim() || null,
          curated_tours_enabled: curatedToursEnabled,
          donations_enabled: donationsEnabled,
          donation_amounts: donationAmounts.length > 0 ? donationAmounts : [5, 10, 20, 50],
          sponsors: sponsors.filter((s) => s.name.trim()),
          sponsor_message: sponsorMessage.trim() || null,
          about_gallery: aboutPhotos.map((p) => ({ url: p.url, caption: p.caption?.trim() || null })),
          about_gallery_title: aboutGalleryTitle.trim() || null,
          about_gallery_layout: aboutGalleryLayout,
          theme_mode: themeMode,
          font_family: fontFamily,
          heading_font_family: headingFont || null,
          background_color: backgroundColor,
          text_color: textColor,
          default_tts_voice: defaultTtsVoice || null,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrg(updated);
        toast({ title: 'Settings saved', description: 'Your changes have been saved.' });
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">No organization found.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground">Manage your organization&apos;s branding and info.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Basic organization information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Organization Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>App Name</Label>
              <Input value={appName} onChange={(e) => setAppName(e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">Shown in the PWA install prompt and browser tab.</p>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div>
              <Label>URL</Label>
              <Input value={`/t/${org.slug}`} disabled />
              <p className="text-xs text-muted-foreground mt-1">Your public tour URL. Contact support to change.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
            <CardDescription>Your organization&apos;s logo displayed in the app header and contact page</CardDescription>
          </CardHeader>
          <CardContent>
            {logoUrl ? (
              <div className="flex items-start gap-4">
                <div className="relative w-32 h-32 rounded-lg border overflow-hidden bg-muted flex-shrink-0">
                  <Image src={logoUrl} alt="Organization logo" fill className="object-contain" sizes="128px" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Current logo</p>
                  <Button variant="outline" size="sm" onClick={() => setLogoUrl('')} className="gap-1">
                    <X className="w-3 h-3" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <MediaUploader
                accept="image/*"
                path={`${org.slug}/branding`}
                organizationId={org.id}
                onUpload={(url) => setLogoUrl(url)}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About Page Photos</CardTitle>
            <CardDescription>
              Optional grid of up to {ABOUT_PHOTO_LIMIT} photos shown on your About page. Visitors can tap a photo to see it larger.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="about-gallery-title">Section Title (optional)</Label>
              <Input
                id="about-gallery-title"
                value={aboutGalleryTitle}
                onChange={(e) => setAboutGalleryTitle(e.target.value)}
                placeholder="e.g. Historic Spots"
              />
            </div>
            <div>
              <Label>Photo Shape</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                {ABOUT_LAYOUTS.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setAboutGalleryLayout(l.value)}
                    aria-pressed={aboutGalleryLayout === l.value}
                    className={`rounded-md border px-3 py-2 text-left text-sm ${aboutGalleryLayout === l.value ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  >
                    <span className="block font-medium">{l.label}</span>
                    <span className="block text-xs opacity-80">{l.hint}</span>
                  </button>
                ))}
              </div>
            </div>
            {aboutPhotos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {aboutPhotos.map((photo, i) => (
                  <div key={photo.url + i} className="rounded-lg border overflow-hidden">
                    <div className="relative aspect-[4/3] bg-muted">
                      <Image src={photo.url} alt={photo.caption || `Photo ${i + 1}`} fill className="object-cover" sizes="200px" />
                      <button
                        type="button"
                        onClick={() => setAboutPhotos((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-1"
                        aria-label="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="p-2 space-y-2">
                      <Input
                        value={photo.caption || ''}
                        onChange={(e) =>
                          setAboutPhotos((prev) => prev.map((p, j) => (j === i ? { ...p, caption: e.target.value } : p)))
                        }
                        placeholder="Caption (optional)"
                        className="h-8 text-xs"
                      />
                      <div className="flex justify-between">
                        <Button type="button" variant="ghost" size="sm" className="h-7 px-2" disabled={i === 0}
                          onClick={() => setAboutPhotos((prev) => moveItem(prev, i, i - 1))} aria-label="Move earlier">
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground self-center">{i + 1}</span>
                        <Button type="button" variant="ghost" size="sm" className="h-7 px-2" disabled={i === aboutPhotos.length - 1}
                          onClick={() => setAboutPhotos((prev) => moveItem(prev, i, i + 1))} aria-label="Move later">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {aboutPhotos.length < ABOUT_PHOTO_LIMIT ? (
              <MediaUploader
                accept="image/*"
                multiple
                path={`${org.slug}/about`}
                organizationId={org.id}
                onUpload={(url) =>
                  setAboutPhotos((prev) => (prev.length < ABOUT_PHOTO_LIMIT ? [...prev, { url, caption: null }] : prev))
                }
              />
            ) : (
              <p className="text-sm text-muted-foreground">You&apos;ve reached the {ABOUT_PHOTO_LIMIT}-photo limit. Remove one to add another.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Customize your tour&apos;s look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border"
                  />
                  <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="font-mono" />
                </div>
              </div>
              <div>
                <Label>Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border"
                  />
                  <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="font-mono" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Theme mode, typography, and page colors for your public tour</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Mode */}
            <div>
              <Label className="mb-2 block">Theme Mode</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleThemeModeToggle('light')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    themeMode === 'light'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeModeToggle('dark')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    themeMode === 'dark'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Switching modes auto-fills sensible background and text defaults.
              </p>
            </div>

            {/* Font Family */}
            <div>
              <Label htmlFor="font-family">Font Family</Label>
              <select
                id="font-family"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Heading Font */}
            <div>
              <Label htmlFor="heading-font">Heading Font</Label>
              <select
                id="heading-font"
                value={headingFont}
                onChange={(e) => setHeadingFont(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Same as font family</option>
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Background & Text Color */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Background Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
              <div>
                <Label>Text Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border"
                  />
                  <Input
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div>
              <Label className="mb-2 block">Preview</Label>
              <div
                className="rounded-lg border p-4 transition-colors"
                style={{
                  backgroundColor: backgroundColor,
                  color: textColor,
                  fontFamily: `"${fontFamily}", ui-sans-serif, system-ui, sans-serif`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span
                    className="font-semibold text-sm"
                    style={headingFont ? { fontFamily: `"${headingFont}", serif` } : undefined}
                  >
                    Sample Heading
                  </span>
                </div>
                <p className="text-sm opacity-80">
                  This is how your tour pages will look with the selected background, text color, and font.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div
                    className="px-3 py-1 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Primary
                  </div>
                  <div
                    className="px-3 py-1 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    Secondary
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Displayed on your public Contact &amp; Support page. Contact email also receives all walker feedback and star ratings submitted through the app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Contact Email</Label>
              <Input
                type="email"
                placeholder="info@example.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Required to receive walker feedback submissions.</p>
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="(631) 555-1234"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
            <div>
              <Label>Address</Label>
              <Textarea
                placeholder="123 Main Street, Your Town, NY 12345"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle>Search Engine Optimization (SEO)</CardTitle>
            <CardDescription>
              Control how your tour appears in Google and other search engines.
              Leave blank to use your app name and description as defaults.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* SEO Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Page Title</Label>
                <span className={`text-xs ${seoTitle.length > 60 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                  {seoTitle.length} / 70
                </span>
              </div>
              <Input
                placeholder={name || 'e.g., Downtown Historic Walking Tour'}
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value.slice(0, 70))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Shown as the clickable headline in Google results. 50–60 characters is ideal.
              </p>
            </div>

            {/* SEO Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Meta Description</Label>
                <span className={`text-xs ${seoDescription.length > 155 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                  {seoDescription.length} / 160
                </span>
              </div>
              <Textarea
                placeholder="e.g., Explore our town's rich history on a free self-guided walking tour. Stamp your card at historic sites. No download required."
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value.slice(0, 160))}
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                The snippet shown under your title in search results. 150–160 characters recommended.
              </p>
            </div>

            {/* Keywords */}
            <div>
              <Label>Keywords</Label>
              <Input
                placeholder="walking tour, historic district, self-guided, your town name, free app"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated. Less important for Google but used by Bing, directories, and app listings.
                Include your town name, "walking tour", and any notable landmarks.
              </p>
            </div>

            {/* Google preview */}
            {(seoTitle || seoDescription || name) && (
              <div className="rounded-lg border p-4 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Google preview</p>
                <p className="text-xs text-green-700 dark:text-green-500 mb-0.5">
                  walkingtourbuilder.com/t/{org?.slug || 'your-slug'}
                </p>
                <p className="text-base text-blue-700 dark:text-blue-400 font-medium leading-snug mb-1 hover:underline cursor-default">
                  {seoTitle || name || 'Your Tour Name'}
                </p>
                <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
                  {seoDescription || description || `Explore ${name || 'your town'} on a free self-guided walking tour.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Donations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              Donations
            </CardTitle>
            <CardDescription>
              Allow walkers to support your tour with a one-time donation on your Contact page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Enable toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show donation section on Contact page</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Walkers can choose a preset amount or enter a custom amount and pay by card or PayPal.
                </p>
              </div>
              <Switch
                checked={donationsEnabled}
                onCheckedChange={setDonationsEnabled}
              />
            </div>

            {/* Preset amounts — only shown when enabled */}
            {donationsEnabled && (
              <div className="space-y-3 pt-1 border-t">
                <div>
                  <p className="text-sm font-medium mb-1">Preset donation amounts (dollars)</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Walkers can also enter any custom amount. You need at least one preset.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[...donationAmounts].sort((a, b) => a - b).map((amt) => (
                      <span
                        key={amt}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm font-medium"
                      >
                        ${amt}
                        {donationAmounts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setDonationAmounts((prev) => prev.filter((a) => a !== amt))}
                            className="ml-0.5 text-muted-foreground hover:text-destructive"
                            aria-label={`Remove $${amt}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  {donationAmounts.length < 6 && (
                    <div className="flex items-center gap-2">
                      <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input
                          type="number"
                          min="1"
                          max="500"
                          placeholder="25"
                          value={newAmount}
                          onChange={(e) => setNewAmount(e.target.value)}
                          className="pl-7"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const v = parseInt(newAmount, 10);
                              if (v >= 1 && v <= 500 && !donationAmounts.includes(v)) {
                                setDonationAmounts((prev) => [...prev, v]);
                                setNewAmount('');
                              }
                            }
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => {
                          const v = parseInt(newAmount, 10);
                          if (v >= 1 && v <= 500 && !donationAmounts.includes(v)) {
                            setDonationAmounts((prev) => [...prev, v]);
                            setNewAmount('');
                          }
                        }}
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment gateway setup instructions */}
            <div className="rounded-lg bg-muted/50 border p-4 space-y-3">
              <p className="text-sm font-semibold">Payment gateway setup</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Donations are processed through <strong>Stripe</strong> (card payments) and <strong>PayPal</strong>.
                To connect your own accounts so payments are deposited directly to you, the following
                environment variables must be configured on your deployment:
              </p>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stripe</p>
                <code className="block text-xs bg-background rounded px-2 py-1 border">STRIPE_SECRET_KEY</code>
                <code className="block text-xs bg-background rounded px-2 py-1 border">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>
                <code className="block text-xs bg-background rounded px-2 py-1 border">STRIPE_WEBHOOK_SECRET</code>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">PayPal</p>
                <code className="block text-xs bg-background rounded px-2 py-1 border">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code>
                <code className="block text-xs bg-background rounded px-2 py-1 border">PAYPAL_CLIENT_SECRET</code>
              </div>
              <div className="flex gap-3 pt-1">
                <a
                  href="https://dashboard.stripe.com/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Create Stripe account <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://developer.paypal.com/dashboard/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  PayPal Developer Dashboard <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground">
                On Vercel, add these under <strong>Project → Settings → Environment Variables</strong>.
                For Stripe webhooks, point your endpoint to{' '}
                <code className="bg-background px-1 rounded border">/api/donations/webhook</code>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sponsors */}
        <Card>
          <CardHeader>
            <CardTitle>Sponsors</CardTitle>
            <CardDescription>
              Acknowledge businesses or donors who underwrite this tour. Shown on your Contact page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="sponsor-message" className="text-sm font-medium">
                Acknowledgement message (optional)
              </Label>
              <Textarea
                id="sponsor-message"
                placeholder="We gratefully acknowledge our donors for their generous support..."
                value={sponsorMessage}
                onChange={(e) => setSponsorMessage(e.target.value)}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">Shown above your sponsor list on the Contact page.</p>
            </div>
            {sponsors.map((sponsor, i) => (
              <div key={i} className="p-3 border rounded-lg space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Sponsor name"
                      value={sponsor.name}
                      onChange={(e) => updateSponsor(i, { name: e.target.value })}
                    />
                    <Input
                      placeholder="Website URL (optional)"
                      value={sponsor.url ?? ''}
                      onChange={(e) => updateSponsor(i, { url: e.target.value || null })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSponsor(i)}
                    aria-label="Remove sponsor"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {sponsor.logo_url ? (
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded border overflow-hidden bg-muted flex-shrink-0">
                      <Image src={sponsor.logo_url} alt={sponsor.name || 'Sponsor logo'} fill className="object-contain" sizes="64px" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => updateSponsor(i, { logo_url: null })}
                    >
                      <X className="w-3 h-3" />
                      Remove logo
                    </Button>
                  </div>
                ) : (
                  <MediaUploader
                    accept="image/*"
                    path={`${org.slug}/sponsors`}
                    organizationId={org.id}
                    onUpload={(url) => updateSponsor(i, { logo_url: url })}
                  />
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addSponsor}>
              <Plus className="w-3 h-3" />
              Add Sponsor
            </Button>
          </CardContent>
        </Card>

        {voices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Default Narration Voice
              </CardTitle>
              <CardDescription>
                Choose the AI voice that will narrate your tour locations. Click <strong>Sample</strong> on any voice to hear a free preview — samples never use a monthly credit. Once you pick a voice, it pre-selects automatically whenever you generate narration in the tour editor. You can change it any time without affecting audio you&apos;ve already generated.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {voices.map((voice) => {
                  const isSelected = (defaultTtsVoice || voices[0].id) === voice.id;
                  const isLoadingPreview = previewLoadingId === voice.id;
                  const isPlayingPreview = previewPlayingId === voice.id;
                  return (
                    <div
                      key={voice.id}
                      onClick={() => setDefaultTtsVoice(voice.id)}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${
                          isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                        }`} />
                        <div>
                          <p className="text-sm font-medium leading-none">{voice.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{voice.description}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleVoicePreview(voice.id); }}
                        disabled={isLoadingPreview}
                        className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border transition-colors flex-shrink-0 ${
                          isPlayingPreview
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-muted/50 hover:bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {isLoadingPreview ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isPlayingPreview ? (
                          <><Square className="w-3 h-3 fill-current" /> Stop</>
                        ) : (
                          <><Play className="w-3 h-3 fill-current" /> Sample</>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {ttsUsage && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Monthly Narration Credits
              </CardTitle>
              <CardDescription>
                Each time you click <strong>Generate Narration</strong> on a tour location, it uses one credit. Voice previews (Sample) are always free and don&apos;t count. Credits reset on the 1st of every month — any unused credits don&apos;t carry over. If you reach your limit, existing narrations keep playing; you just can&apos;t generate new ones until the next reset or a plan upgrade.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {ttsUsage.used} of {ttsUsage.limit === 999999 ? 'unlimited' : ttsUsage.limit} used this month
                </span>
                <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-muted font-medium">
                  {ttsUsage.tier} plan
                </span>
              </div>
              {ttsUsage.limit !== 999999 && (
                <>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        ttsUsage.used / ttsUsage.limit >= 0.9 ? 'bg-destructive' :
                        ttsUsage.used / ttsUsage.limit >= 0.7 ? 'bg-amber-400' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(100, (ttsUsage.used / ttsUsage.limit) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {ttsUsage.limit - ttsUsage.used} credits remaining · resets the 1st of each month
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>Enable or disable optional sections of your public tour site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Curated Theme Tours</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Show a &ldquo;Curated Tours&rdquo; section where you can create pre-built themed tours for walkers.
                  When disabled, the button is hidden from your homepage.
                </p>
              </div>
              <Switch
                checked={curatedToursEnabled}
                onCheckedChange={setCuratedToursEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Subscription Management */}
        <SubscriptionCard />

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
