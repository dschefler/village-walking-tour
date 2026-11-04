import { cn } from '@/lib/utils';

/** Small "Neighborhood" tag for stops that cover an area rather than one building */
export function AreaBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-secondary bg-secondary/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-foreground whitespace-nowrap',
        className
      )}
    >
      Neighborhood
    </span>
  );
}
