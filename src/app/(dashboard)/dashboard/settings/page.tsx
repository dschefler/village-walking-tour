'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, Save, X, Sun, Moon, Mic, Heart, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { useToast } from '@/hooks/use-toast';
import type { Organization } from '@/types';

const FONT_OPTIONS = [
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

export default function SettingsPage() {
  const { toast } = useToast();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ttsUsage, setTtsUsage] = useState<{ used: number; limit: number; tier: string } | null>(null);

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

  // Donation fields
  const [donationsEnabled, setDonationsEnabled] = useState(false);
  const [donationAmounts, setDonationAmounts] = useState<number[]>([5, 10, 20, 50]);
  const [newAmount, setNewAmount] = useState('');

  // Theme fields
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [textColor, setTextColor] = useState('#111827');

  useEffect(() => {
    fetch('/api/tts/usage')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setTtsUsage(data); })
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
            setDonationsEnabled(o.donations_enabled ?? false);
            setDonationAmounts(o.donation_amounts ?? [5, 10, 20, 50]);
            setThemeMode(o.theme_mode || 'light');
            setFontFamily(o.font_family || 'Inter');
            setBackgroundColor(o.background_color || '#FFFFFF');
            setTextColor(o.text_color || '#111827');
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
          donations_enabled: donationsEnabled,
          donation_amounts: donationAmounts.length > 0 ? donationAmounts : [5, 10, 20, 50],
          theme_mode: themeMode,
          font_family: fontFamily,
          background_color: backgroundColor,
          text_color: textColor,
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
                  <span className="font-semibold text-sm">Sample Heading</span>
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
                placeholder="123 Main Street, Southampton, NY 11968"
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
                placeholder={name || 'e.g., Southampton Village Historic Walking Tour'}
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
                placeholder="e.g., Explore Southampton Village's rich history on a free self-guided walking tour. Stamp your card at 10 historic sites. No download required."
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
                placeholder="walking tour, historic district, self-guided, Southampton, free app"
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

        {ttsUsage && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Audio Narrations This Month
              </CardTitle>
              <CardDescription>
                AI-generated voice narrations for your tour locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {ttsUsage.used} of {ttsUsage.limit === 999999 ? 'unlimited' : ttsUsage.limit} used
                </span>
                <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-muted font-medium">
                  {ttsUsage.tier} plan
                </span>
              </div>
              {ttsUsage.limit !== 999999 && (
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, (ttsUsage.used / ttsUsage.limit) * 100)}%` }}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">Resets on the 1st of each month.</p>
            </CardContent>
          </Card>
        )}

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
