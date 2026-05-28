import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Footer } from '@/components/layout/Footer';

async function getOrg(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('organizations')
    .select('name, logo_url, app_name, app_description, contact_address')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  return data;
}

export default async function TenantAboutPage({
  params,
}: {
  params: { orgSlug: string };
}) {
  const org = await getOrg(params.orgSlug);
  const displayName = org?.app_name || org?.name || 'Walking Tour';

  return (
    <div className="min-h-screen flex flex-col">
      <NavigationHeader orgSlug={params.orgSlug} />

      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">About</h1>
          <p className="text-lg opacity-90">{displayName}</p>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 pt-10 pb-6 max-w-3xl text-center">
          {org?.logo_url && (
            <div className="flex justify-center mb-6">
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden ring-4 ring-primary/25 shadow-xl">
                <Image
                  src={org.logo_url}
                  alt={displayName}
                  fill
                  className="object-cover"
                  sizes="176px"
                  priority
                />
              </div>
            </div>
          )}
          <p className="text-lg md:text-xl leading-relaxed text-foreground max-w-2xl mx-auto">
            {org?.app_description || `Welcome to ${displayName} — explore the history, culture, and landmarks that make this destination unique.`}
          </p>
        </section>

        <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6 text-foreground">
          <p className="leading-relaxed">
            This walking tour app brings local history to life. Browse historic sites, build a custom route, and explore at your own pace — whether you're a first-time visitor or a longtime local.
          </p>
          <p className="leading-relaxed">
            Each stop on the tour includes photos, descriptions, and audio guides to help you connect with the stories and people behind the places you visit.
          </p>
          <p className="leading-relaxed">
            Use the app to create a personalized tour from any combination of sites, choose walking or driving directions, and let GPS guide you from stop to stop. Earn stamps as you visit each location, and unlock fun facts along the way.
          </p>
          {org?.contact_address && (
            <p className="leading-relaxed text-muted-foreground">
              {org.contact_address}
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
