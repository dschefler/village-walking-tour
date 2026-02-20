'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, MapPin, HelpCircle, Mail, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HistoricSitesDropdown } from './HistoricSitesDropdown';
import { useTenantOptional } from '@/lib/context/tenant-context';

interface NavigationHeaderProps {
  transparent?: boolean;
  orgSlug?: string;
}

export function NavigationHeader({ transparent = false, orgSlug }: NavigationHeaderProps) {
  const tenant = useTenantOptional();
  const org = tenant?.organization;

  // If orgSlug is provided, prefix tenant links with /t/{orgSlug}
  const prefix = orgSlug ? `/t/${orgSlug}` : '';
  const isTenant = !!orgSlug;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine logo and name
  const logoSrc = (isTenant && org?.logo_url) || '/logo.png';
  const siteName = isTenant ? (org?.name || '') : 'Southampton Village';

  const headerClass = transparent
    ? 'w-full z-50 bg-transparent'
    : 'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60';

  const textClass = transparent ? 'text-white' : '';
  const hoverClass = transparent ? 'hover:text-primary hover:bg-white/60' : 'hover:text-primary hover:bg-gray-100';

  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo / Site Name */}
          <Link href={isTenant ? `${prefix}` : '/'} className={`flex items-center gap-2 font-semibold ${textClass}`}>
            <Image
              src={logoSrc}
              alt={siteName || 'Walking Tour'}
              width={48}
              height={48}
              className="rounded-full"
            />
            <span className="text-sm">{siteName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center gap-1 ${textClass}`}>
            <HistoricSitesDropdown transparent={transparent} orgSlug={orgSlug} />
            <Button variant="ghost" asChild className={hoverClass}>
              <Link href={`${prefix}/how-to-use`} className={`flex items-center gap-2 ${textClass}`}>
                <HelpCircle className="w-4 h-4" />
                How to Use
              </Link>
            </Button>
            {!isTenant && (
              <Button variant="ghost" asChild className={hoverClass}>
                <Link href="/create-your-tour" className={`flex items-center gap-2 ${textClass}`}>
                  <Route className="w-4 h-4" />
                  Create Your Tour
                </Link>
              </Button>
            )}
            <Button variant="ghost" asChild className={hoverClass}>
              <Link href={`${prefix}/contact`} className={`flex items-center gap-2 ${textClass}`}>
                <Mail className="w-4 h-4" />
                Contact
              </Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`md:hidden ${textClass} ${hoverClass}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className={`md:hidden py-4 space-y-2 ${transparent ? 'bg-black/80 rounded-lg px-2' : 'border-t'}`}>
            <Link
              href={`${prefix}/historic-sites`}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg ${hoverClass} ${textClass}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <MapPin className="w-5 h-5" />
              <span>Historic Sites</span>
            </Link>
            <Link
              href={`${prefix}/how-to-use`}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg ${hoverClass} ${textClass}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <HelpCircle className="w-5 h-5" />
              <span>How to Use</span>
            </Link>
            {!isTenant && (
              <Link
                href="/create-your-tour"
                className={`flex items-center gap-3 px-2 py-2 rounded-lg ${hoverClass} ${textClass}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Route className="w-5 h-5" />
                <span>Create Your Tour</span>
              </Link>
            )}
            <Link
              href={`${prefix}/contact`}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg ${hoverClass} ${textClass}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Mail className="w-5 h-5" />
              <span>Contact</span>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
