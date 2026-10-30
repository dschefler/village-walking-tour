'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { AboutPhoto } from '@/types';

// Column count follows the photo count so the grid has no ragged last row
// where possible: 4 and 8 sit in rows of 4, 12 in rows of 4 on wide screens.
function gridCols(count: number): string {
  if (count === 1) return 'grid-cols-1 max-w-2xl mx-auto';
  if (count === 2) return 'grid-cols-2';
  if (count === 4) return 'grid-cols-2 md:grid-cols-4';
  if (count % 4 === 0) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  return 'grid-cols-2 md:grid-cols-3';
}

export function AboutGallery({ photos, title }: { photos: AboutPhoto[]; title?: string | null }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIndex(null);
      if (e.key === 'ArrowRight') setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length));
      if (e.key === 'ArrowLeft') setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, photos.length]);

  if (photos.length === 0) return null;
  const current = isOpen ? photos[openIndex] : null;

  return (
    <section className="container mx-auto px-4 pb-12 max-w-5xl">
      {title && <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">{title}</h2>}
      <div className={`grid gap-3 md:gap-4 ${gridCols(photos.length)}`}>
        {photos.map((photo, i) => (
          <figure key={photo.url + i}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              className="group relative block w-full aspect-[4/3] overflow-hidden rounded-lg bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label={`View larger: ${photo.caption || `photo ${i + 1}`}`}
            >
              <Image
                src={photo.url}
                alt={photo.caption || ''}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </button>
            {photo.caption && (
              <figcaption className="mt-1.5 text-sm text-center text-muted-foreground">{photo.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.caption || 'Photo'}
          className="fixed inset-0 z-[70] bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20"
            aria-label="Close"
            autoFocus
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full max-w-5xl h-[75vh]" onClick={(e) => e.stopPropagation()}>
            <Image src={current.url} alt={current.caption || ''} fill className="object-contain" sizes="100vw" />
          </div>
          {current.caption && <p className="mt-3 text-white text-center">{current.caption}</p>}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpenIndex((openIndex! - 1 + photos.length) % photos.length); }}
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-white/10 hover:bg-white/20"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpenIndex((openIndex! + 1) % photos.length); }}
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-white/10 hover:bg-white/20"
                aria-label="Next photo"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
