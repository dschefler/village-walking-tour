'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Media } from '@/types';

interface ImageGalleryProps {
  images: (Media & { is_primary?: boolean })[];
  className?: string;
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIndex(null);
    };
    if (selectedIndex !== null) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedIndex]);

  if (images.length === 0) return null;

  // Sort: primary first, then by display_order
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return 0;
  });

  const getImageUrl = (image: Media) => {
    if (image.storage_path.startsWith('http') || image.storage_path.startsWith('/')) {
      return image.storage_path;
    }
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tour-media/${image.storage_path}`;
  };

  const goToPrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === 0 ? sortedImages.length - 1 : selectedIndex - 1);
  };

  const goToNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === sortedImages.length - 1 ? 0 : selectedIndex + 1);
  };

  const selectedImage = selectedIndex !== null ? sortedImages[selectedIndex] : null;

  return (
    <div className={cn('', className)}>
      {/* Uniform 3-column grid — all images same size */}
      <div className="grid grid-cols-3 gap-2">
        {sortedImages.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedIndex(index)}
            className="relative aspect-square rounded-lg overflow-hidden bg-muted group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Image
              src={getImageUrl(image)}
              alt={image.alt_text || image.filename}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 22vw, 16vw"
              quality={85}
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setSelectedIndex(null)}
        >
          <div className="absolute inset-0 bg-black/80" />

          {/* Close */}
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors bg-black/40 rounded-full"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 px-3 py-1 text-white text-sm bg-black/40 rounded-full z-10">
            {selectedIndex + 1} / {sortedImages.length}
          </div>

          {/* Image — max 50vw wide, auto height preserves aspect ratio */}
          <div
            className="relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getImageUrl(selectedImage)}
              alt={selectedImage.alt_text || selectedImage.filename}
              style={{ maxWidth: '50vw', maxHeight: '85vh', width: 'auto', height: 'auto' }}
              className="rounded-lg drop-shadow-2xl"
            />
          </div>

          {/* Caption */}
          {selectedImage.caption && (
            <div className="absolute bottom-6 left-0 right-0 text-center z-10">
              <p className="text-white text-sm bg-black/50 inline-block px-4 py-1 rounded-full">
                {selectedImage.caption}
              </p>
            </div>
          )}

          {/* Navigation arrows */}
          {sortedImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
