'use client';

import Link from 'next/link';
import { MapPin, HelpCircle, Mail, Heart, Info, Route, Bookmark } from 'lucide-react';
import { ShareAppButton } from '@/components/ShareAppButton';
import { useTenantOptional } from '@/lib/context/tenant-context';

export function Footer() {
  const tenant = useTenantOptional();
  const org = tenant?.organization;
  const currentYear = new Date().getFullYear();

  const p = (path: string) => org ? `/t/${org.slug}${path}` : path;

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Quick Links</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <Link href={p('/about')} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors">
            <Info className="w-4 h-4 text-primary shrink-0" />
            About
          </Link>
          <Link href={p('/how-to-use')} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors">
            <HelpCircle className="w-4 h-4 text-primary shrink-0" />
            How to Use
          </Link>
          <Link href={p('/historic-sites')} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            Historic Sites
          </Link>
          <Link href={p('/create-your-tour')} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors">
            <Route className="w-4 h-4 text-primary shrink-0" />
            Create Your Tour
          </Link>
          <Link href={p('/curated-tours')} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors">
            <Bookmark className="w-4 h-4 text-primary shrink-0" />
            Curated Tours
          </Link>
          <Link href={p('/contact')} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors">
            <Mail className="w-4 h-4 text-primary shrink-0" />
            Contact
          </Link>
          <Link href={p('/contact')} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors">
            <Heart className="w-4 h-4 text-primary shrink-0" />
            Support Us
          </Link>
          <ShareAppButton />
        </div>
      </div>

      <div className="bg-primary">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center gap-0.5">
            <p className="text-sm text-white whitespace-nowrap">
              &copy; {currentYear} {org ? org.name : 'Southampton Village Walking Tour'}.
            </p>
            <p className="text-sm text-white whitespace-nowrap">All rights reserved.</p>
            {!org && (
              <p className="text-xs text-white/75">
                Designed and Developed by{' '}
                <a
                  href="https://thorncreativemarketing.us/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Thorn Creative Marketing
                </a>
              </p>
            )}
            <p className="text-xs text-white/75">
              Powered by{' '}
              <a
                href="https://walkingtourbuilder.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white transition-colors"
              >
                Walking Tour Builder
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
