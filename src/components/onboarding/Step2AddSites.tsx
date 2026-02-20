'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Trash2, GripVertical, Loader2, MapPin, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MediaUploader } from '@/components/admin/MediaUploader';
import type { Organization, Site } from '@/types';

interface Step2Props {
  org: Organization;
  existingTourId: string | null;
  coverImageUrl?: string;
  onComplete: (tourId: string) => void;
}

interface SiteImage {
  url: string;
  mediaId?: string;
}

interface SiteFormData {
  id?: string;
  name: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  featuredImage: SiteImage | null;
  images: SiteImage[];
}

const emptySite = (): SiteFormData => ({
  name: '',
  description: '',
  address: '',
  latitude: '',
  longitude: '',
  featuredImage: null,
  images: [],
});

export function Step2AddSites({ org, existingTourId, coverImageUrl, onComplete }: Step2Props) {
  const [sites, setSites] = useState<SiteFormData[]>([emptySite()]);
  const [tourId, setTourId] = useState(existingTourId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!!existingTourId);

  // Load existing sites if resuming
  useEffect(() => {
    if (!existingTourId) {
      setLoading(false);
      return;
    }
    async function loadSites() {
      try {
        const res = await fetch(`/api/sites?tourId=${existingTourId}`);
        if (res.ok) {
          const data: Site[] = await res.json();
          if (data.length > 0) {
            setSites(
              data.map((s) => ({
                id: s.id,
                name: s.name,
                description: s.description || '',
                address: s.address || '',
                latitude: String(s.latitude),
                longitude: String(s.longitude),
                featuredImage: null,
                images: [],
              }))
            );
          }
        }
      } catch {
        // Start fresh
      } finally {
        setLoading(false);
      }
    }
    loadSites();
  }, [existingTourId]);

  const addSite = () => setSites((prev) => [...prev, emptySite()]);

  const removeSite = (index: number) => {
    setSites((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSite = (index: number, field: keyof SiteFormData, value: string) => {
    setSites((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const setFeaturedImage = (index: number, url: string, mediaId?: string) => {
    setSites((prev) =>
      prev.map((s, i) => (i === index ? { ...s, featuredImage: { url, mediaId } } : s))
    );
  };

  const removeFeaturedImage = (index: number) => {
    setSites((prev) =>
      prev.map((s, i) => (i === index ? { ...s, featuredImage: null } : s))
    );
  };

  const addSiteImage = (index: number, url: string, mediaId?: string) => {
    setSites((prev) =>
      prev.map((s, i) =>
        i === index && s.images.length < 6
          ? { ...s, images: [...s.images, { url, mediaId }] }
          : s
      )
    );
  };

  const removeSiteImage = (siteIndex: number, imageIndex: number) => {
    setSites((prev) =>
      prev.map((s, i) =>
        i === siteIndex
          ? { ...s, images: s.images.filter((_, j) => j !== imageIndex) }
          : s
      )
    );
  };

  const handleSubmit = async () => {
    const validSites = sites.filter((s) => s.name.trim() && s.latitude && s.longitude);
    if (validSites.length === 0) {
      setError('Add at least one site with a name and coordinates.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let activeTourId = tourId;
      if (!activeTourId) {
        const tourRes = await fetch('/api/tours', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `${org.name} Tour`,
            slug: `${org.slug}-tour`,
            description: org.app_description || `A walking tour of ${org.name}`,
            organization_id: org.id,
            is_published: false,
            cover_image_url: coverImageUrl || null,
          }),
        });
        if (!tourRes.ok) throw new Error('Failed to create tour');
        const tour = await tourRes.json();
        activeTourId = tour.id;
        setTourId(tour.id);
      } else if (coverImageUrl) {
        // Update existing tour with cover image from Step 1
        await fetch(`/api/tours/${activeTourId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cover_image_url: coverImageUrl }),
        });
      }

      // Create/update sites and link images
      for (let i = 0; i < validSites.length; i++) {
        const site = validSites[i];
        const siteBody = {
          tour_id: activeTourId,
          organization_id: org.id,
          name: site.name,
          description: site.description || null,
          address: site.address || null,
          latitude: parseFloat(site.latitude),
          longitude: parseFloat(site.longitude),
          display_order: i + 1,
          is_published: true,
        };

        let siteId = site.id;

        if (site.id) {
          await fetch(`/api/sites/${site.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(siteBody),
          });
        } else {
          const siteRes = await fetch('/api/sites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(siteBody),
          });
          if (siteRes.ok) {
            const created = await siteRes.json();
            siteId = created.id;
          }
        }

        // Create site_media records for featured + gallery images
        if (siteId) {
          const mediaRecords: { site_id: string; media_id: string; display_order: number; is_primary: boolean }[] = [];

          // Featured image first (primary)
          if (site.featuredImage?.mediaId) {
            mediaRecords.push({
              site_id: siteId,
              media_id: site.featuredImage.mediaId,
              display_order: 0,
              is_primary: true,
            });
          }

          // Gallery images after
          site.images
            .filter((img) => img.mediaId)
            .forEach((img, idx) => {
              mediaRecords.push({
                site_id: siteId,
                media_id: img.mediaId!,
                display_order: idx + 1,
                is_primary: false,
              });
            });

          if (mediaRecords.length > 0) {
            await fetch('/api/site-media', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ records: mediaRecords }),
            });
          }
        }
      }

      // Update onboarding step
      await fetch(`/api/organizations/${org.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboarding_step: 3 }),
      });

      onComplete(activeTourId!);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Add Your Tour Sites</h2>
        <p className="text-sm text-muted-foreground">
          Add the locations visitors will walk to. You can always add more later.
        </p>
      </div>

      {/* Sites */}
      <div className="space-y-4">
        {sites.map((site, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-1 pt-2 text-muted-foreground">
                  <GripVertical className="w-4 h-4" />
                  <span className="text-sm font-medium w-5 text-center">{index + 1}</span>
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <Label>Site Name *</Label>
                    <Input
                      placeholder="e.g., Rogers Memorial Library"
                      value={site.name}
                      onChange={(e) => updateSite(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input
                      placeholder="e.g., 91 Coopers Farm Road, Southampton, NY"
                      value={site.address}
                      onChange={(e) => updateSite(index, 'address', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Latitude *</Label>
                      <Input
                        type="number"
                        step="any"
                        placeholder="40.88621"
                        value={site.latitude}
                        onChange={(e) => updateSite(index, 'latitude', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Longitude *</Label>
                      <Input
                        type="number"
                        step="any"
                        placeholder="-72.39332"
                        value={site.longitude}
                        onChange={(e) => updateSite(index, 'longitude', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Tell visitors about this location..."
                      value={site.description}
                      onChange={(e) => updateSite(index, 'description', e.target.value)}
                      rows={2}
                    />
                  </div>

                  {/* Featured Image */}
                  <div>
                    <Label>Featured Image</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      The main photo for this location.
                    </p>
                    {site.featuredImage ? (
                      <div className="relative aspect-video rounded-lg overflow-hidden border">
                        <Image src={site.featuredImage.url} alt="Featured" fill className="object-cover" sizes="400px" />
                        <button
                          onClick={() => removeFeaturedImage(index)}
                          className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <MediaUploader
                        accept="image/*"
                        path={`${org.slug}/sites`}
                        organizationId={org.id}
                        onUpload={(url, mediaId) => setFeaturedImage(index, url, mediaId)}
                        className="[&_div]:py-3"
                      />
                    )}
                  </div>

                  {/* Site Gallery */}
                  <div>
                    <Label className="flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" />
                      Gallery Photos (up to 6)
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Additional photos visitors will see in the app.
                    </p>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {site.images.map((img, imgIdx) => (
                        <div key={imgIdx} className="relative aspect-square rounded-lg overflow-hidden border">
                          <Image src={img.url} alt={`Site photo ${imgIdx + 1}`} fill className="object-cover" sizes="150px" />
                          <button
                            onClick={() => removeSiteImage(index, imgIdx)}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {site.images.length < 6 && (
                      <MediaUploader
                        accept="image/*"
                        path={`${org.slug}/sites`}
                        organizationId={org.id}
                        onUpload={(url, mediaId) => addSiteImage(index, url, mediaId)}
                        className="[&_div]:py-3"
                      />
                    )}
                  </div>
                </div>

                {sites.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeSite(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" onClick={addSite} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Add Another Site
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 inline mr-1" />
          {sites.filter((s) => s.name.trim()).length} site(s) added
        </p>
        <Button onClick={handleSubmit} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Continue to Fun Facts'
          )}
        </Button>
      </div>
    </div>
  );
}
