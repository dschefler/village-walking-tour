'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LocationItem {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
}

interface StartExploringButtonProps {
  orgSlug?: string;
}

export function StartExploringButton({ orgSlug }: StartExploringButtonProps) {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const prefix = orgSlug ? `/t/${orgSlug}` : '';

  useEffect(() => {
    async function fetchLocations() {
      try {
        const url = orgSlug ? `/api/locations?orgSlug=${orgSlug}` : '/api/locations';
        const response = await fetch(url);
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
  }, [orgSlug]);

  if (loading) {
    return (
      <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/80 gap-2" disabled>
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (locations.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/80 gap-2">
          Start Exploring
          <ChevronDown className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 max-h-80 overflow-y-auto">
        {locations.map((location) => (
          <DropdownMenuItem key={location.id} asChild>
            <Link
              href={`${prefix}/location/${location.slug || location.id}`}
              className="flex items-start gap-3 cursor-pointer py-2 text-left w-full"
            >
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
              <div className="flex flex-col gap-0.5 text-left flex-1">
                <span className="font-medium text-left">{location.name}</span>
                {location.address && (
                  <span className="text-xs text-[#014487] line-clamp-1 text-left">
                    {location.address}
                  </span>
                )}
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
