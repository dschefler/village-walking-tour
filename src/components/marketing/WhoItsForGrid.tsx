'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

const CARDS = [
  {
    image: '/images/audience/historic-cities.jpg',
    title: 'Historic Cities & Downtown Districts',
    description: 'Bring architecture, stories, and landmarks to life for residents and visitors.',
  },
  {
    image: '/images/audience/town-village.jpg',
    title: 'Towns, Villages & Chambers of Commerce',
    description: 'Drive foot traffic and showcase what makes your community worth exploring.',
  },
  {
    image: '/images/audience/college-campus.jpg',
    title: 'Colleges & Universities',
    description: 'Turn campus orientations and admissions tours into adventures students love.',
  },
  {
    image: '/images/audience/parks-recreation.jpg',
    title: 'Parks & Recreation',
    description: 'Guide visitors through trails, gardens, and natural landmarks with audio.',
  },
  {
    image: '/images/audience/camping-hiking.jpg',
    title: 'Nature Reserves & Hiking',
    description: 'Self-guided trail narration with GPS — no ranger escort needed.',
  },
  {
    image: '/images/audience/craft-markets.jpg',
    title: 'Craft & Holiday Markets',
    description: 'Help shoppers discover every vendor and make the most of your event.',
  },
  {
    image: '/images/audience/trade-show.jpg',
    title: 'Trade Shows & Exhibitions',
    description: 'Navigate large venues and spotlight must-see exhibitors and demos.',
  },
  {
    image: '/images/audience/corporate-campus.jpg',
    title: 'Corporate Campuses',
    description: 'Onboard new employees with guided facility tours they can take at their own pace.',
  },
  {
    image: '/images/audience/destination-resort.jpg',
    title: 'Destination Resorts',
    description: 'Delight guests with curated on-property discovery tours and activities.',
  },
  {
    image: '/images/audience/wineries.jpg',
    title: 'Wineries & Brewery Trails',
    description: 'Connect stops along a scenic tasting route with narrated stories at each pour.',
  },
];

export function WhoItsForGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll<HTMLElement>('[data-card]');
    if (!cards) return;

    // Start hidden
    cards.forEach((card) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(36px)';
      card.style.transition = 'opacity 0.65s ease, transform 0.65s ease';
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const allCards = gridRef.current?.querySelectorAll<HTMLElement>('[data-card]');
            allCards?.forEach((card, i) => {
              setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
              }, i * 70);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.08 }
    );

    if (gridRef.current) observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-3 block">
            Built for every destination
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Who Benefits from a Walking Tour App?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Any place people walk, explore, or discover — Walking Tour Builder turns
            that journey into an engaging, narrated experience.
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {CARDS.map((card) => (
            <div
              key={card.title}
              data-card
              className="group rounded-2xl overflow-hidden bg-background border border-border/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Image */}
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              </div>

              {/* Text */}
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-semibold text-sm leading-snug mb-1 text-foreground">
                  {card.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
