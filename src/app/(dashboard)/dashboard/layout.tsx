import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Map, Image, LogOut, Home, Settings, Wand2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

async function signOut() {
  'use server';
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's org
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, role, organization:organizations(name, slug)')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  const orgData = membership?.organization as unknown as { name: string; slug: string } | null;
  const orgName = orgData?.name || 'Your Organization';
  const orgSlug = orgData?.slug;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="font-bold text-lg">Tour Dashboard</h1>
          <p className="text-xs text-muted-foreground truncate">{orgName}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/tours"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            <Map className="w-5 h-5" />
            Tours
          </Link>
          <Link
            href="/dashboard/media"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            <Image className="w-5 h-5" />
            Media Library
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <Link
            href="/dashboard/onboarding"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-primary"
          >
            <Wand2 className="w-5 h-5" />
            Setup Wizard
          </Link>
        </nav>

        <div className="p-4 border-t space-y-1">
          {orgSlug && (
            <Link
              href={`/t/${orgSlug}`}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
            >
              <Home className="w-5 h-5" />
              View Public Site
            </Link>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-muted/30">
        {children}
      </main>
    </div>
  );
}
