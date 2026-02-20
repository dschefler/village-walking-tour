import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Map, Users, Eye, ArrowRight, Wand2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Get user's org
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, role, organization:organizations(*)')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!membership) {
    redirect('/dashboard/onboarding');
  }

  const org = membership.organization as Record<string, any>;

  // Get stats
  const { count: tourCount } = await supabase
    .from('tours')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', org.id);

  const { count: siteCount } = await supabase
    .from('sites')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', org.id);

  const { count: publishedCount } = await supabase
    .from('tours')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', org.id)
    .eq('is_published', true);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{org.name}</h1>
          <p className="text-muted-foreground">Dashboard overview</p>
        </div>
        {!org.onboarding_completed && (
          <Button asChild>
            <Link href="/dashboard/onboarding" className="gap-2">
              <Wand2 className="w-4 h-4" />
              Complete Setup
            </Link>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tours</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tourCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              {publishedCount || 0} published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{siteCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public URL</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link
              href={`/t/${org.slug}`}
              className="text-sm text-primary hover:underline"
            >
              /t/{org.slug}
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Manage Tours</CardTitle>
            <CardDescription>Create and edit your walking tours</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/dashboard/tours" className="gap-2">
                Go to Tours
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Organization Settings</CardTitle>
            <CardDescription>Update branding, colors, and domain</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/dashboard/settings" className="gap-2">
                Go to Settings
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
