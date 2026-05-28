'use client';

import Link from 'next/link';
import { Bookmark, ChevronDown, LayoutList } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { OrgCuratedTour } from '@/types';

interface CuratedToursDropdownProps {
  transparent?: boolean;
  orgSlug?: string;
  tours: OrgCuratedTour[];
}

export function CuratedToursDropdown({ transparent = false, orgSlug, tours }: CuratedToursDropdownProps) {
  if (tours.length === 0) return null;

  const prefix = orgSlug ? `/t/${orgSlug}` : '';
  const buttonClass = transparent
    ? 'text-white hover:text-primary hover:bg-white/60'
    : 'hover:text-primary hover:bg-gray-100';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`flex items-center gap-1 ${buttonClass}`}>
          <Bookmark className="w-4 h-4" />
          Curated Tours
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuItem asChild>
          <Link
            href={`${prefix}/curated-tours`}
            className="flex items-center gap-2 cursor-pointer font-medium text-primary"
          >
            <LayoutList className="w-4 h-4" />
            View All Curated Tours
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {tours.map((tour) => (
          <DropdownMenuItem key={tour.slug} asChild>
            <Link
              href={`${prefix}/curated-tours/${tour.slug}`}
              className="flex flex-col items-start gap-0.5 cursor-pointer text-left w-full"
            >
              <span className="font-medium text-left">{tour.name}</span>
              <span className="text-xs text-muted-foreground text-left">
                {tour.site_names.length} location{tour.site_names.length !== 1 ? 's' : ''}
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
