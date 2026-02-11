'use client';

import { useState, useEffect, useRef } from 'react';
import Map, { Marker, type MapRef, type MapMouseEvent } from 'react-map-gl';
import { MapPin, Trash2, Eye, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { MediaUploader } from './MediaUploader';
import { AddressInput } from './AddressInput';
import { MAPBOX_CONFIG } from '@/lib/mapbox/config';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '@/lib/utils';
import { reverseGeocode, type GeocodingResult } from '@/lib/mapbox/geocoding';
import type { Site } from '@/types';
import 'mapbox-gl/dist/mapbox-gl.css';

interface SiteEditorProps {
  tourId: string;
  site: Site | null;
  displayOrder: number;
  onClose: () => void;
}

export function SiteEditor({ tourId, site, displayOrder, onClose }: SiteEditorProps) {
  const { toast } = useToast();
  const mapRef = useRef<MapRef>(null);
  const supabase = createClient();

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: 40.8843,
    longitude: -72.3903,
    audio_url: '',
    address: '',
    address_formatted: '',
    is_published: false,
    slug: '',
  });

  useEffect(() => {
    if (site) {
      setFormData({
        name: site.name,
        description: site.description || '',
        latitude: site.latitude,
        longitude: site.longitude,
        audio_url: site.audio_url || '',
        address: site.address || '',
        address_formatted: site.address_formatted || '',
        is_published: site.is_published,
        slug: site.slug || '',
      });
    }
  }, [site]);

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      // Only auto-generate slug if it's empty or matches the previous auto-generated slug
      slug: !prev.slug || prev.slug === slugify(prev.name) ? slugify(name) : prev.slug,
    }));
  };

  // Handle geocoding result
  const handleGeocode = (result: GeocodingResult) => {
    setFormData((prev) => ({
      ...prev,
      latitude: result.latitude,
      longitude: result.longitude,
      address_formatted: result.addressFormatted,
    }));
    mapRef.current?.flyTo({
      center: [result.longitude, result.latitude],
      zoom: 17,
    });
  };

  // Reverse geocode when marker is moved
  const handleReverseGeocode = async (lat: number, lng: number) => {
    const result = await reverseGeocode(lat, lng);
    if (result) {
      setFormData((prev) => ({
        ...prev,
        address: result.placeName,
        address_formatted: result.addressFormatted,
      }));
    }
  };

  const handleMapClick = (e: MapMouseEvent) => {
    setFormData((prev) => ({
      ...prev,
      latitude: e.lngLat.lat,
      longitude: e.lngLat.lng,
    }));
  };

  const handleMarkerDrag = (e: { lngLat: { lat: number; lng: number } }) => {
    setFormData((prev) => ({
      ...prev,
      latitude: e.lngLat.lat,
      longitude: e.lngLat.lng,
    }));
  };

  const handleMarkerDragEnd = (e: { lngLat: { lat: number; lng: number } }) => {
    handleReverseGeocode(e.lngLat.lat, e.lngLat.lng);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Error',
        description: 'Geolocation is not supported',
        variant: 'destructive',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        mapRef.current?.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 17,
        });
      },
      (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    );
  };

  const handleAudioUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, audio_url: url }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Site name is required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      if (site) {
        // Update existing site
        const { error } = await supabase
          .from('sites')
          .update({
            name: formData.name,
            description: formData.description || null,
            latitude: formData.latitude,
            longitude: formData.longitude,
            audio_url: formData.audio_url || null,
            address: formData.address || null,
            address_formatted: formData.address_formatted || null,
            is_published: formData.is_published,
            slug: formData.slug || null,
          })
          .eq('id', site.id);

        if (error) throw error;

        toast({
          title: 'Saved',
          description: 'Site updated successfully',
        });
      } else {
        // Create new site
        const { error } = await supabase.from('sites').insert({
          tour_id: tourId,
          name: formData.name,
          description: formData.description || null,
          latitude: formData.latitude,
          longitude: formData.longitude,
          audio_url: formData.audio_url || null,
          address: formData.address || null,
          address_formatted: formData.address_formatted || null,
          is_published: formData.is_published,
          slug: formData.slug || null,
          display_order: displayOrder,
        });

        if (error) throw error;

        toast({
          title: 'Created',
          description: 'Site created successfully',
        });
      }

      onClose();
    } catch (err) {
      console.error('Save error:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save site',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!site) return;

    setDeleting(true);

    try {
      const { error } = await supabase.from('sites').delete().eq('id', site.id);

      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Site deleted successfully',
      });

      onClose();
    } catch (err) {
      console.error('Delete error:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete site',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Site Name */}
      <div className="space-y-2">
        <Label htmlFor="site-name">Site Name *</Label>
        <Input
          id="site-name"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g., Historic Church"
        />
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <Label htmlFor="site-slug">URL Slug</Label>
        <Input
          id="site-slug"
          value={formData.slug}
          onChange={(e) => setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
          placeholder="historic-church"
        />
        <p className="text-xs text-muted-foreground">
          Used in the location URL: /location/{formData.slug || 'your-slug'}
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="site-description">Description</Label>
        <Textarea
          id="site-description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Tell visitors about this site..."
          rows={3}
        />
      </div>

      {/* Address Input */}
      <div className="space-y-2">
        <Label>Address</Label>
        <AddressInput
          value={formData.address}
          addressFormatted={formData.address_formatted}
          onChange={(address) => setFormData((prev) => ({ ...prev, address }))}
          onGeocode={handleGeocode}
          placeholder="Enter street address to auto-fill coordinates..."
        />
      </div>

      {/* Location Picker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Location</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleGetCurrentLocation}>
            Use Current Location
          </Button>
        </div>
        <div className="h-64 rounded-lg overflow-hidden border">
          <Map
            ref={mapRef}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            initialViewState={{
              longitude: formData.longitude,
              latitude: formData.latitude,
              zoom: 15,
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle={MAPBOX_CONFIG.style}
            onClick={handleMapClick}
          >
            <Marker
              longitude={formData.longitude}
              latitude={formData.latitude}
              draggable
              onDrag={handleMarkerDrag}
              onDragEnd={handleMarkerDragEnd}
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg cursor-move">
                <MapPin className="w-5 h-5 text-white" />
              </div>
            </Marker>
          </Map>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="latitude" className="text-xs">
              Latitude
            </Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="longitude" className="text-xs">
              Longitude
            </Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))
              }
            />
          </div>
        </div>
      </div>

      {/* Audio Narration */}
      <div className="space-y-2">
        <Label>Audio Narration</Label>
        {formData.audio_url ? (
          <div className="space-y-2">
            <audio controls className="w-full">
              <source src={formData.audio_url} />
            </audio>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormData((prev) => ({ ...prev, audio_url: '' }))}
            >
              Remove Audio
            </Button>
          </div>
        ) : (
          <MediaUploader onUpload={handleAudioUpload} accept="audio/*" path={`sites/${site?.id || 'new'}`} />
        )}
      </div>

      {/* Publish Toggle */}
      <div className="flex items-center justify-between py-4 border-t border-b">
        <div className="space-y-0.5">
          <Label htmlFor="is-published">Publish Location</Label>
          <p className="text-xs text-muted-foreground">
            Make this location visible on its own page
          </p>
        </div>
        <Switch
          id="is-published"
          checked={formData.is_published}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_published: checked }))}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        {site ? (
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="w-4 h-4 mr-2" />
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        ) : (
          <div />
        )}
        <div className="flex gap-2">
          {site && formData.slug && (
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open(`/location/${formData.slug}`, '_blank')}
              disabled={!formData.is_published}
              title={!formData.is_published ? 'Publish the location to preview' : 'Preview location page'}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : site ? 'Update Site' : 'Create Site'}
          </Button>
        </div>
      </div>
    </div>
  );
}
