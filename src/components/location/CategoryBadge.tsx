import { cn } from '@/lib/utils';
import { getSiteCategory, siteCategoryKeys } from '@/lib/site-categories';

/** Colored tag with the stop's category icon, e.g. "Public Art"; renders nothing if uncategorized */
export function CategoryBadge({ category, className }: { category?: string | null; className?: string }) {
  const def = getSiteCategory(category);
  if (!def) return null;
  const Icon = def.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white whitespace-nowrap',
        className
      )}
      style={{ backgroundColor: def.color }}
    >
      <Icon className="w-3 h-3" aria-hidden="true" />
      {def.label}
    </span>
  );
}

/** One CategoryBadge per category the stop belongs to, primary first */
export function CategoryBadges({ site, className }: { site: { category?: string | null; categories?: string[] | null }; className?: string }) {
  const keys = siteCategoryKeys(site);
  if (keys.length === 0) return null;
  return (
    <span className={cn('inline-flex flex-wrap gap-1', className)}>
      {keys.map((k) => <CategoryBadge key={k} category={k} />)}
    </span>
  );
}
