import Link from 'next/link';
import { Map, Image, MapPin, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

async function getStats() {
  const supabase = createClient();

  const [toursResult, sitesResult, mediaResult] = await Promise.all([
    supabase.from('tours').select('id', { count: 'exact' }),
    supabase.from('sites').select('id', { count: 'exact' }),
    supabase.from('media').select('id', { count: 'exact' }),
  ]);

  return {
    totalTours: toursResult.count || 0,
    totalSites: sitesResult.count || 0,
    totalMedia: mediaResult.count || 0,
  };
}

async function getRecentTours() {
  const supabase = createClient();

  const { data } = await supabase
    .from('tours')
    .select('id, name, slug, is_published, updated_at')
    .order('updated_at', { ascending: false })
    .limit(5);

  return data || [];
}

export default async function AdminDashboard() {
  const stats = await getStats();
  const recentTours = await getRecentTours();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your walking tours</p>
        </div>
        <Button asChild>
          <Link href="/admin/tours/new">
            <Plus className="w-4 h-4 mr-2" />
            New Tour
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tours</CardTitle>
            <Map className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTours}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSites}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Media Files</CardTitle>
            <Image className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMedia}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tours */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tours</CardTitle>
          <CardDescription>Your most recently updated tours</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTours.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center">
              No tours yet. Create your first tour to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {recentTours.map((tour) => (
                <div
                  key={tour.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <Link
                      href={`/admin/tours/${tour.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      {tour.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Updated {new Date(tour.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        tour.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {tour.is_published ? 'Published' : 'Draft'}
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/tours/${tour.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
