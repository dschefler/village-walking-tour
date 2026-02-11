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

  // Close lightbox on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIndex(null);
      }
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

  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return 0;
  });

  const primaryImage = sortedImages[0];
  const galleryImages = sortedImages.slice(1);

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
    <div className={cn('space-y-4', className)}>
      {/* Main Image - Square */}
      <div
        className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer group"
        onClick={() => setSelectedIndex(0)}
      >
        <Image
          src={getImageUrl(primaryImage)}
          alt={primaryImage.alt_text || primaryImage.filename}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      </div>

      {/* Gallery Thumbnails - Row of 3 Square Images */}
      {galleryImages.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {galleryImages.slice(0, 3).map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index + 1)}
              className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer group"
            >
              <Image
                src={getImageUrl(image)}
                alt={image.alt_text || image.filename}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 20vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedIndex !== null && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setSelectedIndex(null)}
        >
          {/* Dark overlay - 25% darker */}
          <div className="absolute inset-0 bg-black/75" />

          {/* Image container - 75% height */}
          <div
            className="relative w-auto max-w-[90vw] h-[75vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button - upper right corner */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute -top-12 right-0 z-10 p-2 text-white hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Image */}
            <div className="relative h-full aspect-square max-h-[75vh]">
              <Image
                src={getImageUrl(selectedImage)}
                alt={selectedImage.alt_text || selectedImage.filename}
                fill
                className="object-contain"
                sizes="75vh"
                priority
              />
            </div>

            {/* Navigation arrows */}
            {sortedImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Caption */}
            {selectedImage.caption && (
              <div className="absolute -bottom-10 left-0 right-0 text-center">
                <p className="text-white text-sm">{selectedImage.caption}</p>
              </div>
            )}

            {/* Counter */}
            <div className="absolute -top-12 left-0 px-3 py-1 text-white text-sm">
              {selectedIndex + 1} / {sortedImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
