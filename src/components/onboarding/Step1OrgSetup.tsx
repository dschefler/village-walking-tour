'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { slugify } from '@/lib/utils';
import type { Organization } from '@/types';

interface Step1Props {
  existingOrg: Organization | null;
  existingCoverImageUrl?: string;
  onComplete: (org: Organization, coverImageUrl: string) => void;
}

export function Step1OrgSetup({ existingOrg, existingCoverImageUrl, onComplete }: Step1Props) {
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

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Organization name is required');
      return;
    }
    if (!slug.trim()) {
      setError('URL slug is required');
      return;
    }

    setSaving(true);
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
            onboarding_step: 2,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update');
        }
        const updated = await res.json();
        onComplete(updated, coverImage);
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
        onComplete(newOrg, coverImage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

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
              onUpload={(url) => setCoverImage(url)}
            />
          )}
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button onClick={handleSubmit} disabled={saving} size="lg">
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
  );
}
