'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Pencil, Trash2, X, Check, GripVertical, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { OrgCuratedTour } from '@/types';

interface SiteOption {
  id: string;
  name: string;
}

const TIME_ESTIMATES = ['30 minutes', '45 minutes', '1 hour', '1.5 hours', '2 hours', '3 hours', 'Half day'];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function TourForm({
  initial,
  sites,
  onSave,
  onCancel,
}: {
  initial?: Partial<OrgCuratedTour>;
  sites: SiteOption[];
  onSave: (data: Partial<OrgCuratedTour>) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [tagline, setTagline] = useState(initial?.tagline ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [timeEstimate, setTimeEstimate] = useState(initial?.time_estimate ?? '');
  const [selectedSiteNames, setSelectedSiteNames] = useState<string[]>(initial?.site_names ?? []);
  const [saving, setSaving] = useState(false);

  const toggleSite = (siteName: string) => {
    setSelectedSiteNames((prev) =>
      prev.includes(siteName) ? prev.filter((n) => n !== siteName) : [...prev, siteName]
    );
  };

  const handleNameChange = (v: string) => {
    setName(v);
    if (!initial?.slug) setSlug(slugify(v));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !slug.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        slug: slug.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        time_estimate: timeEstimate,
        site_names: selectedSiteNames,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tour Name *</Label>
          <Input value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g., Black History Walk" />
        </div>
        <div>
          <Label>URL Slug *</Label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated" />
          <p className="text-xs text-muted-foreground mt-1">Used in the URL: /curated-tours/{slug || 'slug'}</p>
        </div>
      </div>

      <div>
        <Label>Tagline</Label>
        <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Short, catchy subtitle for this tour" />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What will walkers see and learn on this tour?" />
      </div>

      <div>
        <Label>Estimated Time</Label>
        <select
          value={timeEstimate}
          onChange={(e) => setTimeEstimate(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">— not specified —</option>
          {TIME_ESTIMATES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <Label className="mb-2 block">
          Select Locations
          <span className="text-muted-foreground font-normal ml-1">
            ({selectedSiteNames.length} selected)
          </span>
        </Label>
        {sites.length === 0 ? (
          <p className="text-sm text-muted-foreground">No historic sites found. Add sites to your tour first.</p>
        ) : (
          <div className="max-h-52 overflow-y-auto rounded-md border divide-y">
            {sites.map((site) => {
              const checked = selectedSiteNames.includes(site.name);
              return (
                <label
                  key={site.id}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSite(site.name)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{site.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSubmit} disabled={saving || !name.trim() || !slug.trim()} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {initial?.id ? 'Save Changes' : 'Create Tour'}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export default function CuratedToursAdminPage() {
  const { toast } = useToast();
  const [tours, setTours] = useState<OrgCuratedTour[]>([]);
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgSlug, setOrgSlug] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Get org slug
        const orgRes = await fetch('/api/organizations');
        if (orgRes.ok) {
          const orgs = await orgRes.json();
          if (orgs.length > 0) {
            const slug = orgs[0].slug as string;
            setOrgSlug(slug);

            // Load sites for this org
            const sitesRes = await fetch(`/api/locations?orgSlug=${slug}`);
            if (sitesRes.ok) {
              const sitesData = await sitesRes.json();
              setSites(sitesData.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })));
            }
          }
        }

        // Load curated tours (auth'd)
        const toursRes = await fetch('/api/curated-tours');
        if (toursRes.ok) setTours(await toursRes.json());
      } catch {
        toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  const handleCreate = async (data: Partial<OrgCuratedTour>) => {
    const res = await fetch('/api/curated-tours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, display_order: tours.length }),
    });
    if (res.ok) {
      const created = await res.json();
      setTours((prev) => [...prev, created]);
      setCreating(false);
      toast({ title: 'Tour created' });
    } else {
      const err = await res.json();
      toast({ title: 'Error', description: err.error, variant: 'destructive' });
    }
  };

  const handleUpdate = async (id: string, data: Partial<OrgCuratedTour>) => {
    const res = await fetch(`/api/curated-tours/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setTours((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditingId(null);
      toast({ title: 'Tour updated' });
    } else {
      const err = await res.json();
      toast({ title: 'Error', description: err.error, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this curated tour?')) return;
    const res = await fetch(`/api/curated-tours/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setTours((prev) => prev.filter((t) => t.id !== id));
      toast({ title: 'Tour deleted' });
    } else {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Curated Theme Tours</h1>
          <p className="text-muted-foreground mt-1">
            Create pre-built tours grouped by topic, era, or time available.
            Walkers can select which sites to include and get an optimized route.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            To show or hide the Curated Tours section on your homepage, go to{' '}
            <a href="/dashboard/settings" className="underline text-primary">Settings → Features</a>.
          </p>
        </div>
        {!creating && (
          <Button onClick={() => setCreating(true)} className="gap-2 flex-shrink-0">
            <Plus className="w-4 h-4" />
            New Tour
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Create form */}
        {creating && (
          <Card className="border-primary/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">New Curated Tour</CardTitle>
            </CardHeader>
            <CardContent>
              <TourForm
                sites={sites}
                onSave={handleCreate}
                onCancel={() => setCreating(false)}
              />
            </CardContent>
          </Card>
        )}

        {/* Existing tours */}
        {tours.length === 0 && !creating ? (
          <div className="text-center py-16 rounded-xl border-2 border-dashed border-border text-muted-foreground">
            <GripVertical className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No curated tours yet</p>
            <p className="text-sm mt-1">Click &ldquo;New Tour&rdquo; to create your first themed tour.</p>
          </div>
        ) : (
          tours.map((tour) => (
            <Card key={tour.id}>
              {editingId === tour.id ? (
                <>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Edit: {tour.name}</CardTitle>
                      <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <TourForm
                      initial={tour}
                      sites={sites}
                      onSave={(data) => handleUpdate(tour.id, data)}
                      onCancel={() => setEditingId(null)}
                    />
                  </CardContent>
                </>
              ) : (
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{tour.name}</h3>
                      {tour.tagline && (
                        <p className="text-sm text-primary font-medium mt-0.5">{tour.tagline}</p>
                      )}
                      {tour.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{tour.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        {tour.time_estimate && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" /> {tour.time_estimate}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" /> {tour.site_names.length} location{tour.site_names.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-muted-foreground/60">
                          /curated-tours/{tour.slug}
                        </span>
                      </div>
                      {tour.site_names.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {tour.site_names.map((n) => (
                            <span key={n} className="text-xs bg-primary/8 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                              {n}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(tour.id)} className="gap-1">
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(tour.id)} className="gap-1 text-destructive hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {orgSlug && tours.length > 0 && (
        <p className="text-xs text-muted-foreground mt-6">
          Public URL: <a href={`/t/${orgSlug}/curated-tours`} target="_blank" rel="noreferrer" className="underline text-primary">/t/{orgSlug}/curated-tours</a>
        </p>
      )}
    </div>
  );
}
