import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Footer } from '@/components/layout/Footer';

export default function TenantAboutPage({
  params,
}: {
  params: { orgSlug: string };
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationHeader orgSlug={params.orgSlug} />

      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">About</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Southampton Village Historical Walking Tours
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        <div className="prose prose-lg max-w-none space-y-6 text-foreground">
          <p className="text-lg leading-relaxed">
            Welcome to the Southampton Village Historical Walking Tours — a journey through one of
            America&apos;s oldest and most storied communities.
          </p>

          <p className="leading-relaxed">
            First settled in 1640 as part of Southampton Town and incorporated as the Village of
            Southampton in 1894, this community began with a small group of English settlers who
            sailed from Lynn, Massachusetts and landed at what is now known as Conscience Point,
            establishing the first permanent English settlement in New York State.
          </p>

          <p className="leading-relaxed">
            From its earliest days, Southampton&apos;s history has been deeply connected to the land
            and waters surrounding it. The Shinnecock Indian Nation played a vital role in the
            survival of the early settlers, sharing knowledge of farming, fishing, shellfishing, and
            local resources that helped sustain the growing community.
          </p>

          <p className="leading-relaxed">
            Over the centuries, Southampton evolved from a small colonial settlement into a thriving
            maritime and agricultural village. Farming, fishing, duck-raising, and eventually the
            whaling industry shaped daily life and fueled the local economy throughout the 18th and
            19th centuries. Following the arrival of the Long Island Rail Road in 1872, Southampton
            entered a new era as wealthy New Yorkers discovered the beauty of the East End and began
            building the grand estates and summer retreats that helped define the Village&apos;s
            character in the early 20th century.
          </p>

          <p className="leading-relaxed">
            Today, Southampton Village is a unique blend of colonial history, maritime heritage,
            natural beauty, architecture, art and culture.
          </p>

          <p className="leading-relaxed">
            Step back in time and explore the streets, landmarks, businesses, homes and stories that
            shaped generations of life in Southampton.
          </p>

          <p className="leading-relaxed">
            As our nation approaches its 250th Anniversary, the Village is proud to launch this
            Historical Walking Tour series as a way to celebrate and preserve the people, places and
            moments that continue to define Southampton Village&apos;s remarkable history.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
