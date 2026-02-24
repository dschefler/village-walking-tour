'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, Save, X, Sun, Moon, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
            <CardDescription>Displayed on your public Contact &amp; Support page so visitors can reach you</CardDescription>
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
