'use client';

import Link from 'next/link';
import { MapPin, HelpCircle, Mail, Heart, Info, Route, Bookmark } from 'lucide-react';
import { ShareAppButton } from '@/components/ShareAppButton';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Quick Links</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <Link href="/about" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors">
            <Info className="w-4 h-4 text-[#A40000] shrink-0" />
            About
          </Link>
          <Link href="/how-to-use" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors">
            <HelpCircle className="w-4 h-4 text-[#A40000] shrink-0" />
            How to Use
          </Link>
          <Link href="/historic-sites" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors">
            <MapPin className="w-4 h-4 text-[#A40000] shrink-0" />
            Historic Sites
          </Link>
          <Link href="/create-your-tour" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors">
            <Route className="w-4 h-4 text-[#A40000] shrink-0" />
            Create Your Tour
          </Link>
          <Link href="/curated-tours" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors">
            <Bookmark className="w-4 h-4 text-[#A40000] shrink-0" />
            Curated Tours
          </Link>
          <Link href="/contact" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors">
            <Mail className="w-4 h-4 text-[#A40000] shrink-0" />
            Contact
          </Link>
          <Link href="/contact" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors">
            <Heart className="w-4 h-4 text-[#A40000] shrink-0" />
            Support Us
          </Link>
          <ShareAppButton />
        </div>
      </div>

      <div className="bg-primary">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-0.5">
            <p className="text-sm text-white">
              &copy; {currentYear} Southampton Village Walking Tour. All rights reserved.
            </p>
            <p className="text-xs text-white/75">
              Designed and Developed by Thorn Creative Marketing
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
