'use client';

import Image from 'next/image';
import { MapPin } from 'lucide-react';
import type { Media } from '@/types';

interface LocationHeroProps {
  name: string;
  primaryImage?: Media & { is_primary: boolean; display_order: number };
  address?: string | null;
}

function getImageUrl(storagePath: string) {
  if (storagePath.startsWith('http') || storagePath.startsWith('/')) {
    return storagePath;
  }
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tour-media/${storagePath}`;
}

export function LocationHero({ name, primaryImage, address }: LocationHeroProps) {
  return (
    <div className="relative">
      {primaryImage ? (
        <div className="relative aspect-[21/9] md:aspect-[3/1] w-full">
          <Image
            src={getImageUrl(primaryImage.storage_path)}
            alt={primaryImage.alt_text || name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      ) : (
        <div className="aspect-[21/9] md:aspect-[3/1] w-full bg-gradient-to-br from-primary to-primary/80" />
      )}

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
            {name}
          </h1>
          {address && (
            <p className="flex items-center gap-2 text-white/80 text-lg">
              <MapPin className="w-5 h-5" />
              {address}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
