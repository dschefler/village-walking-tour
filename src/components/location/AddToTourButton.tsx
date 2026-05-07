'use client';

import { Plus, Check, Route } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTourBuilderStore } from '@/stores/tour-builder-store';
import { Button } from '@/components/ui/button';

interface AddToTourButtonProps {
  siteId: string;
}

export function AddToTourButton({ siteId }: AddToTourButtonProps) {
  const { pendingIds, toggle } = useTourBuilderStore();
  const router = useRouter();
  const isAdded = pendingIds.includes(siteId);

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={() => toggle(siteId)}
        variant={isAdded ? 'default' : 'outline'}
        className="w-full gap-2"
      >
        {isAdded ? (
          <><Check className="w-4 h-4" /> Added to Tour</>
        ) : (
          <><Plus className="w-4 h-4" /> Add to Tour</>
        )}
      </Button>
      {isAdded && (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => router.push('/historic-sites')}
        >
          <Route className="w-4 h-4" />
          Back to Historic Sites
        </Button>
      )}
    </div>
  );
}
