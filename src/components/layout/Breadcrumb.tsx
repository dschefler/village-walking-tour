import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 py-2 flex items-center gap-1 text-xs text-gray-500 flex-wrap">
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
