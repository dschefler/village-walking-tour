import Image from 'next/image';
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
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">About</h1>
          <p className="text-lg opacity-90">Southampton Village Historical Walking Tours</p>
        </div>
      </header>

      <main className="flex-1">

        {/* Seal + welcome */}
        <section className="container mx-auto px-4 pt-10 pb-6 max-w-3xl text-center">
          <div className="flex justify-center mb-6">
            <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden ring-4 ring-primary/25 shadow-xl">
              <Image
                src="/about/village-seal.jpg"
                alt="Village of Southampton seal — Settled 1640, Incorporated 1894"
                fill
                className="object-cover"
                sizes="176px"
                priority
              />
            </div>
          </div>
          <p className="text-lg md:text-xl leading-relaxed text-foreground max-w-2xl mx-auto">
            Welcome to the Southampton Village Historical Walking Tours — a journey through one of
            America&apos;s oldest and most storied communities.
          </p>
        </section>

        {/* Full-width historic Main Street photo */}
        <div className="relative w-full h-52 sm:h-72 md:h-96 overflow-hidden my-4">
          <Image
            src="/about/historic-main-street.webp"
            alt="Historic Main Street, Southampton Village"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
            <p className="text-white text-sm text-center italic">Main Street, Southampton Village</p>
          </div>
        </div>

        {/* Body text + signs */}
        <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6 text-foreground">

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

          {/* Street sign pair */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 my-2">
            <figure className="space-y-1.5">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-md">
                <Image
                  src="/about/towne-street-sign.jpg"
                  alt="Ye Towne Street Opened 1648 — State Education Department marker"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 350px"
                />
              </div>
              <figcaption className="text-xs text-muted-foreground text-center">
                Ye Towne Street, opened 1648
              </figcaption>
            </figure>
            <figure className="space-y-1.5">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-md">
                <Image
                  src="/about/jobs-lane-sign.jpg"
                  alt="Jobs Lane Opened 1664"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 350px"
                />
              </div>
              <figcaption className="text-xs text-muted-foreground text-center">
                Jobs Lane, opened 1664
              </figcaption>
            </figure>
          </div>

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

          <p className="leading-relaxed pb-4">
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
