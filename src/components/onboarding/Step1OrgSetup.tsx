'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { slugify } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { Organization } from '@/types';

interface Step1Props {
  existingOrg: Organization | null;
  existingCoverImageUrl?: string;
  existingTourId?: string | null;
  onComplete: (org: Organization, coverImageUrl: string) => void;
  onSave?: (org: Organization, coverImageUrl: string) => void;
}

export function Step1OrgSetup({ existingOrg, existingCoverImageUrl, existingTourId, onComplete, onSave }: Step1Props) {
  const [name, setName] = useState(existingOrg?.name || '');
  const [slug, setSlug] = useState(existingOrg?.slug || '');
  const [description, setDescription] = useState(existingOrg?.app_description || '');
  const [primaryColor, setPrimaryColor] = useState(existingOrg?.primary_color || '#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState(existingOrg?.secondary_color || '#1E40AF');
  const [coverImage, setCoverImage] = useState(existingCoverImageUrl || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugManuallyEdited) {
      setSlug(slugify(value));
    }
  };

  const [savingOnly, setSavingOnly] = useState(false);

  const saveData = async (advanceStep: boolean) => {
    if (!name.trim()) {
      setError('Organization name is required');
      return;
    }
    if (!slug.trim()) {
      setError('URL slug is required');
      return;
    }

    if (advanceStep) {
      setSaving(true);
    } else {
      setSavingOnly(true);
    }
    setError('');

    try {
      if (existingOrg) {
        // Update existing
        const res = await fetch(`/api/organizations/${existingOrg.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            app_name: name,
            app_description: description,
            primary_color: primaryColor,
            secondary_color: secondaryColor,
            ...(advanceStep ? { onboarding_step: 2 } : {}),
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update');
        }
        const updated = await res.json();

        // Save cover image directly to the tour if one exists
        if (coverImage && existingTourId) {
          const tourRes = await fetch(`/api/tours/${existingTourId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cover_image_url: coverImage }),
          });
          if (tourRes.ok) {
            toast({ title: 'Cover image saved', description: 'Tour cover photo updated.' });
          } else {
            const errText = await tourRes.text();
            toast({ title: 'Cover image failed', description: errText, variant: 'destructive' });
          }
        } else if (!coverImage) {
          toast({ title: 'No cover image', description: 'Upload a cover photo first.', variant: 'destructive' });
        } else if (!existingTourId) {
          toast({ title: 'No tour yet', description: 'Cover will be saved when you create sites in Step 2.' });
        }

        if (advanceStep) {
          onComplete(updated, coverImage);
        } else {
          onSave?.(updated, coverImage);
          toast({ title: 'Progress saved', description: 'Your organization info has been saved.' });
        }
      } else {
        // Create new
        const res = await fetch('/api/organizations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            slug,
            app_name: name,
            app_description: description,
            primary_color: primaryColor,
            secondary_color: secondaryColor,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to create organization');
        }
        const newOrg = await res.json();
        if (advanceStep) {
          onComplete(newOrg, coverImage);
        } else {
          onSave?.(newOrg, coverImage);
          toast({ title: 'Progress saved', description: 'Your organization has been created.' });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
      setSavingOnly(false);
    }
  };

  const handleSubmit = () => saveData(true);
  const handleSave = () => saveData(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Tell us about your organization</h2>
        <p className="text-sm text-muted-foreground">
          This info will be used to brand your walking tour app.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="org-name">Organization Name *</Label>
          <Input
            id="org-name"
            placeholder="e.g., Southampton Village Walking Tour"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            This appears in the app header and PWA install prompt.
          </p>
        </div>

        <div>
          <Label htmlFor="org-slug">URL Slug *</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">/t/</span>
            <Input
              id="org-slug"
              placeholder="southampton"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                setSlugManuallyEdited(true);
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Your tour will be accessible at this URL. Only lowercase letters, numbers, and hyphens.
          </p>
        </div>

        <div>
          <Label htmlFor="org-description">Description</Label>
          <Textarea
            id="org-description"
            placeholder="Explore the rich history and hidden stories..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="primary-color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Used for buttons, links, and highlights.
            </p>
          </div>
          <div>
            <Label htmlFor="secondary-color">Secondary Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="secondary-color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border"
              />
              <Input
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="border rounded-lg p-4 bg-muted/30">
          <p className="text-xs text-muted-foreground mb-3">Preview</p>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-full"
              style={{ backgroundColor: primaryColor }}
            />
            <div>
              <p className="font-semibold">{name || 'Your Organization'}</p>
              <p className="text-xs text-muted-foreground">/t/{slug || 'your-slug'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 rounded text-sm text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Start Tour
            </button>
            <button
              className="px-3 py-1.5 rounded text-sm text-white"
              style={{ backgroundColor: secondaryColor }}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Tour Cover Photo */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <Label className="text-base font-semibold">Tour Cover Photo</Label>
          <p className="text-sm text-muted-foreground">
            This is the main image visitors see when they open your tour. Use a wide, scenic photo of your area.
          </p>
          {coverImage ? (
            <div className="relative aspect-video rounded-lg overflow-hidden border">
              <Image src={coverImage} alt="Tour cover" fill className="object-cover" sizes="600px" />
              <button
                onClick={() => setCoverImage('')}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <MediaUploader
              accept="image/*"
              path={`${slug || 'org'}/tours`}
              organizationId={existingOrg?.id}
              onUpload={(url) => setCoverImage(url)}
            />
          )}
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={handleSave} disabled={saving || savingOnly} size="lg">
          {savingOnly ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save
            </>
          )}
        </Button>
        <Button onClick={handleSubmit} disabled={saving || savingOnly} size="lg">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Continue to Add Sites'
          )}
        </Button>
      </div>
    </div>
  );
}
