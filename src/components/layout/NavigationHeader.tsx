'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, MapPin, HelpCircle, Mail, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HistoricSitesDropdown } from './HistoricSitesDropdown';

interface NavigationHeaderProps {
  transparent?: boolean;
  orgSlug?: string;
}

export function NavigationHeader({ transparent = false, orgSlug }: NavigationHeaderProps) {
  // If orgSlug is provided, prefix all links with /t/{orgSlug}
  const prefix = orgSlug ? `/t/${orgSlug}` : '';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <Link href={prefix || '/'} className={`flex items-center gap-2 font-semibold ${textClass}`}>
            <Image
              src="/logo.png"
              alt="Walking Tour"
              width={48}
              height={48}
              className="rounded-full"
            />
            {!orgSlug && <span className="text-sm">Southampton Village</span>}
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
            {!orgSlug && (
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
            {!orgSlug && (
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
              <span>Contact & Donate</span>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
