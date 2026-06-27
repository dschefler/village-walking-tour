import Link from 'next/link';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  backHref?: string; // override back destination (defaults to one level up or '/')
  backLabel?: string; // override back label (defaults to parent crumb or 'Home')
}

export function Breadcrumb({ items, backHref, backLabel }: BreadcrumbProps) {
  // Resolve back destination: explicit override → parent item → home
  const parent = items.length > 1 ? items[items.length - 2] : null;
  const resolvedBackHref = backHref ?? parent?.href ?? '/';
  const resolvedBackLabel = backLabel ?? parent?.label ?? 'Home';

  return (
    <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-200">
      {/* Mobile: full-width tappable back button (min 44px touch target) */}
      <div className="md:hidden flex items-center">
        <Link
          href={resolvedBackHref}
          className="flex items-center gap-2 px-4 py-3 w-full text-sm font-medium text-primary active:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 flex-shrink-0" />
          <span>{resolvedBackLabel}</span>
        </Link>
      </div>

      {/* Desktop: small breadcrumb trail */}
      <div className="hidden md:flex container mx-auto px-4 py-2 items-center gap-1 text-xs text-gray-500 flex-wrap">
        <Link href="/" className="flex items-center gap-0.5 hover:text-primary transition-colors">
          <Home className="w-3 h-3" />
          <span>Home</span>
        </Link>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={i}>
              <ChevronRight className="w-3 h-3 flex-shrink-0 text-gray-300" />
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-primary transition-colors truncate max-w-[180px]">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-gray-800 font-medium truncate max-w-[200px]' : 'truncate max-w-[180px]'}>
                  {item.label}
                </span>
              )}
            </Fragment>
          );
        })}
      </div>
    </nav>
  );
}
