'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, ChevronDown, Loader2, Map } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useOrgSites } from '@/hooks/use-org-sites';

interface HistoricSitesDropdownProps {
  transparent?: boolean;
  orgSlug?: string;
}

export function HistoricSitesDropdown({ transparent = false, orgSlug }: HistoricSitesDropdownProps) {
  const { sites: locations, categories, loading } = useOrgSites(orgSlug);
  // Tours that tag their stops by category list categories here instead of every stop
  const byCategory = categories.length > 0;
  const prefix = orgSlug ? `/t/${orgSlug}` : '';
  const pathname = usePathname();
  const isActive = !!orgSlug && !!pathname?.startsWith(`${prefix}/historic-sites`);

  const buttonClass = transparent
    ? 'text-white hover:text-primary hover:bg-white/60'
    : 'hover:text-primary hover:bg-gray-100';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`flex items-center gap-1 ${buttonClass} ${isActive ? 'rounded-b-none shadow-[inset_0_-2px_0_0_hsl(var(--secondary))]' : ''}`}>
          <MapPin className={`w-4 h-4 ${orgSlug ? 'text-secondary' : ''}`} />
          {byCategory ? 'All Sites' : 'Historic Sites'}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 max-h-96 overflow-y-auto">
        {byCategory ? (
          <>
            <DropdownMenuItem asChild>
              <Link
                href={`${prefix}/historic-sites`}
                className="flex items-center gap-2 cursor-pointer font-medium text-primary"
              >
                <Map className="w-4 h-4" />
                All Sites
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {categories.map(({ key, label, color, icon: Icon }) => (
              <DropdownMenuItem key={key} asChild>
                <Link href={`${prefix}/historic-sites?category=${key}`} className="flex items-center gap-2 cursor-pointer">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: color }}>
                    <Icon className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                  </span>
                  {label}
                </Link>
              </DropdownMenuItem>
            ))}
          </>
        ) : (
        <>
        {/* View All Link */}
        <DropdownMenuItem asChild>
          <Link
            href={`${prefix}/historic-sites`}
            className="flex items-center gap-2 cursor-pointer font-medium text-primary"
          >
            <Map className="w-4 h-4" />
            View All Sites & Map
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : locations.length === 0 ? (
          <div className="px-2 py-4 text-sm text-muted-foreground text-center">
            No historic sites available
          </div>
        ) : (
          locations.map((location) => (
            <DropdownMenuItem key={location.id} asChild>
              <Link
                href={`${prefix}/location/${location.slug || location.id}`}
                className="flex flex-col items-start gap-0.5 cursor-pointer text-left w-full"
              >
                <span className="font-medium text-left">{location.name}</span>
                {location.address && (
                  <span className="text-xs text-secondary line-clamp-1 text-left">
                    {location.address}
                  </span>
                )}
              </Link>
            </DropdownMenuItem>
          ))
        )}
        </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
