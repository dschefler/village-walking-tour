'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  GripVertical,
  MapPin,
  Eye,
  QrCode,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { SiteEditor } from '@/components/admin/SiteEditor';
import { QRCodeGenerator } from '@/components/admin/QRCodeGenerator';
import { cn, slugify } from '@/lib/utils';
import type { Tour, Site } from '@/types';

export default function EditTourPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const tourId = params.tourId as string;

  const [tour, setTour] = useState<Tour | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    estimated_time: '',
    distance_km: '',
    is_published: false,
    cover_image_url: '',
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSiteEditor, setShowSiteEditor] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  const supabase = createClient();

  const loadTour = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: tourData, error: tourError } = await supabase
      .from('tours')
      .select('*')
      .eq('id', tourId)
      .single();

    if (tourError || !tourData) {
      setError('Tour not found');
      setLoading(false);
      return;
    }

    setTour(tourData);
    setFormData({
      name: tourData.name,
      slug: tourData.slug,
      description: tourData.description || '',
      estimated_time: tourData.estimated_time?.toString() || '',
      distance_km: tourData.distance_km?.toString() || '',
      is_published: tourData.is_published,
      cover_image_url: tourData.cover_image_url || '',
    });

    const { data: sitesData } = await supabase
      .from('sites')
      .select('*')
      .eq('tour_id', tourId)
      .order('display_order');

    setSites(sitesData || []);
    setLoading(false);
  }, [supabase, tourId]);

  useEffect(() => {
    loadTour();
  }, [loadTour]);

  const handleSave = async () => {
    setSaving(true);

    const { error: updateError } = await supabase
      .from('tours')
      .update({
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        estimated_time: formData.estimated_time ? parseInt(formData.estimated_time, 10) : null,
        distance_km: formData.distance_km ? parseFloat(formData.distance_km) : null,
        is_published: formData.is_published,
        cover_image_url: formData.cover_image_url || null,
      })
      .eq('id', tourId);

    setSaving(false);

    if (updateError) {
      toast({
        title: 'Error',
        description: updateError.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Saved',
      description: 'Tour updated successfully',
    });
  };

  const handleDelete = async () => {
    const { error: deleteError } = await supabase
      .from('tours')
      .delete()
      .eq('id', tourId);

    if (deleteError) {
      toast({
        title: 'Error',
        description: deleteError.message,
        variant: 'destructive',
      });
      return;
    }

    router.push('/admin/tours');
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sites);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    // Update display_order for all items
    const updatedSites = items.map((site, index) => ({
      ...site,
      display_order: index + 1,
    }));

    setSites(updatedSites);

    // Update in database
    for (const site of updatedSites) {
      await supabase
        .from('sites')
        .update({ display_order: site.display_order })
        .eq('id', site.id);
    }
  };

  const handleAddSite = () => {
    setEditingSite(null);
    setShowSiteEditor(true);
  };

  const handleEditSite = (site: Site) => {
    setEditingSite(site);
    setShowSiteEditor(true);
  };

  const handleSiteEditorClose = () => {
    setShowSiteEditor(false);
    setEditingSite(null);
    loadTour();
  };

  const handleCoverImageUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, cover_image_url: url }));
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="p-6">
        <p className="text-destructive">{error || 'Tour not found'}</p>
        <Button asChild className="mt-4">
          <Link href="/admin/tours">Back to Tours</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/tours">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Tour</h1>
            <p className="text-muted-foreground">{tour.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {formData.is_published && (
            <>
              <Button variant="outline" onClick={() => setShowQRCode(true)}>
                <QrCode className="w-4 h-4 mr-2" />
                QR Code
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/tour/${formData.slug}`} target="_blank">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Link>
              </Button>
            </>
          )}
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tour Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tour Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tour Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                      slug: slugify(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimated_time">Estimated Time (min)</Label>
                  <Input
                    id="estimated_time"
                    type="number"
                    value={formData.estimated_time}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, estimated_time: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distance_km">Distance (km)</Label>
                  <Input
                    id="distance_km"
                    type="number"
                    step="0.1"
                    value={formData.distance_km}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, distance_km: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="published">Published</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this tour visible to the public
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_published: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Sites */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sites</CardTitle>
                <CardDescription>Drag to reorder sites on the tour</CardDescription>
              </div>
              <Button onClick={handleAddSite}>
                <Plus className="w-4 h-4 mr-2" />
                Add Site
              </Button>
            </CardHeader>
            <CardContent>
              {sites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <p>No sites yet. Add your first site to get started.</p>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="sites">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {sites.map((site, index) => (
                          <Draggable key={site.id} draggableId={site.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={cn(
                                  'flex items-center gap-3 p-3 bg-muted rounded-lg',
                                  snapshot.isDragging && 'shadow-lg'
                                )}
                              >
                                <div {...provided.dragHandleProps} className="cursor-grab">
                                  <GripVertical className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                                  {site.display_order}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{site.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {site.latitude.toFixed(6)}, {site.longitude.toFixed(6)}
                                  </p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleEditSite(site)}>
                                  Edit
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cover Image */}
          <Card>
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.cover_image_url ? (
                <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                  <Image
                    src={formData.cover_image_url}
                    alt="Cover"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
                  <p className="text-muted-foreground text-sm">No cover image</p>
                </div>
              )}
              <MediaUploader
                onUpload={handleCoverImageUpload}
                accept="image/*"
                bucket="tour-media"
                path={`tours/${tourId}`}
                organizationId={tour?.organization_id ?? undefined}
              />
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Tour
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tour</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tour? This action cannot be undone
              and will also delete all associated sites.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Site Editor Dialog */}
      <Dialog open={showSiteEditor} onOpenChange={setShowSiteEditor}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSite ? 'Edit Site' : 'Add Site'}</DialogTitle>
          </DialogHeader>
          <SiteEditor
            tourId={tourId}
            site={editingSite}
            displayOrder={sites.length + 1}
            onClose={handleSiteEditorClose}
            organizationId={tour?.organization_id ?? undefined}
          />
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tour QR Code</DialogTitle>
            <DialogDescription>
              Scan this code to open the tour on a mobile device
            </DialogDescription>
          </DialogHeader>
          <QRCodeGenerator
            url={`https://southamptonwalkingtour.com/t/southampton/tour/${formData.slug}`}
            tourName={formData.name}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
