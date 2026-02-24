import Link from 'next/link';
import Image from 'next/image';
import { Plus, MoreHorizontal, Eye, Edit, Trash2, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

async function getTours() {
  const supabase = createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', 'southampton')
    .single();

  const { data, error } = await supabase
    .from('tours')
    .select(`
      *,
      sites:sites(count)
    `)
    .eq('organization_id', org?.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching tours:', error);
    return [];
  }

  return data || [];
}

export default async function ToursPage() {
  const tours = await getTours();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Tours</h1>
          <p className="text-muted-foreground">Manage your walking tours</p>
        </div>
        <Button asChild>
          <Link href="/admin/tours/new">
            <Plus className="w-4 h-4 mr-2" />
            New Tour
          </Link>
        </Button>
      </div>

      {tours.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tours Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first walking tour to get started.
            </p>
            <Button asChild>
              <Link href="/admin/tours/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Tour
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => {
            const siteCount = tour.sites?.[0]?.count || 0;

            return (
              <Card key={tour.id} className="overflow-hidden">
                {tour.cover_image_url ? (
                  <div className="relative aspect-video">
                    <Image
                      src={tour.cover_image_url}
                      alt={tour.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          tour.is_published
                            ? 'bg-green-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {tour.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center relative">
                    <MapPin className="w-12 h-12 text-muted-foreground" />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          tour.is_published
                            ? 'bg-green-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {tour.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{tour.name}</CardTitle>
                  <CardDescription>
                    {siteCount} site{siteCount !== 1 ? 's' : ''}
                    {tour.distance_km && ` • ${tour.distance_km} km`}
                    {tour.estimated_time && ` • ${tour.estimated_time} min`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/admin/tours/${tour.id}/edit`}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    {tour.is_published && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/tour/${tour.slug}`} target="_blank">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
