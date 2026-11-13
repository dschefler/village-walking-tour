import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Map, ChevronRight } from 'lucide-react';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Footer } from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase/server';
import { getOrgCategoryCounts } from '@/lib/org-categories';

export const metadata = { title: 'Start Your Tour' };

/** "Start Your Tour" — pick All Sites or one category, then browse them on the sites map */
export default async function StartYourTourPage({ params }: { params: { orgSlug: string } }) {
  const supabase = createClient();
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', params.orgSlug)
    .single();
  if (!org) notFound();

  const { total, categories } = await getOrgCategoryCounts(org.id);
  const sitesHref = `/t/${params.orgSlug}/historic-sites`;
  const countLabel = (n: number) => `${n} site${n !== 1 ? 's' : ''}`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavigationHeader orgSlug={params.orgSlug} />

      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Start Your Tour</h1>
          <p className="opacity-90">What would you like to explore?</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          <Link
            href={sitesHref}
            className="sm:col-span-2 lg:col-span-3 flex items-center gap-4 rounded-xl bg-primary text-primary-foreground p-5 shadow-md hover:shadow-lg hover:bg-primary/90 transition"
          >
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-white/20 flex-shrink-0">
              <Map className="w-7 h-7" aria-hidden="true" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-xl font-bold">All Sites</span>
              <span className="block text-sm opacity-90">Everything on one map · {countLabel(total)}</span>
            </span>
            <ChevronRight className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
          </Link>

          {categories.map(({ key, label, description, color, icon: Icon, count }) => (
            <Link
              key={key}
              href={`${sitesHref}?category=${key}`}
              className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm border-l-[6px] hover:shadow-md transition"
              style={{ borderLeftColor: color }}
            >
              <span className="flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: color }}>
                <Icon className="w-6 h-6 text-white" aria-hidden="true" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-semibold text-gray-900 leading-snug">{label}</span>
                <span className="block text-xs text-gray-500 line-clamp-2">{description}</span>
                <span className="block text-xs font-medium mt-0.5" style={{ color }}>{countLabel(count)}</span>
              </span>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
