'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { slugify } from '@/lib/utils';

export default function NewTourPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    estimated_time: '',
    distance_km: '',
  });

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: slugify(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { data, error: insertError } = await supabase
      .from('tours')
      .insert({
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        estimated_time: formData.estimated_time ? parseInt(formData.estimated_time, 10) : null,
        distance_km: formData.distance_km ? parseFloat(formData.distance_km) : null,
        is_published: false,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/admin/tours/${data.id}/edit`);
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/tours">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Tour</h1>
          <p className="text-muted-foreground">Create a new walking tour</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tour Details</CardTitle>
          <CardDescription>
            Enter the basic information for your tour. You can add sites and
            media after creating the tour.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Tour Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Historic Village Walk"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="historic-village-walk"
              />
              <p className="text-xs text-muted-foreground">
                This will be used in the tour URL: /tour/{formData.slug || 'your-slug'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Explore the rich history of our village..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_time">Estimated Time (minutes)</Label>
                <Input
                  id="estimated_time"
                  type="number"
                  value={formData.estimated_time}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, estimated_time: e.target.value }))
                  }
                  placeholder="60"
                  min="1"
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
                  placeholder="2.5"
                  min="0.1"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Tour'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/tours">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
