'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, ChevronDown, Loader2, Map } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface LocationItem {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
}

interface HistoricSitesDropdownProps {
  transparent?: boolean;
}

export function HistoricSitesDropdown({ transparent = false }: HistoricSitesDropdownProps) {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch('/api/locations');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, []);

  const buttonClass = transparent
    ? 'text-white hover:text-[#A40000] hover:bg-white/60'
    : 'hover:text-[#A40000] hover:bg-gray-100';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`flex items-center gap-1 ${buttonClass}`}>
          <MapPin className="w-4 h-4" />
          Historic Sites
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 max-h-96 overflow-y-auto">
        {/* View All Link */}
        <DropdownMenuItem asChild>
          <Link
            href="/historic-sites"
            className="flex items-center gap-2 cursor-pointer font-medium text-[#A40000]"
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
                href={`/location/${location.slug || location.id}`}
                className="flex flex-col items-start gap-0.5 cursor-pointer text-left w-full"
              >
                <span className="font-medium text-left">{location.name}</span>
                {location.address && (
                  <span className="text-xs text-[#014487] line-clamp-1 text-left">
                    {location.address}
                  </span>
                )}
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
