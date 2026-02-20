'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, HelpCircle, Mail, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white text-black">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold mb-3 text-black">
              <Image
                src="/logo.png"
                alt="Village of Southampton"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span>Southampton Village Walking Tour</span>
            </Link>
            <p className="text-sm text-gray-600">
              Explore the rich history and hidden stories of Southampton Village through
              this self-guided walking tour.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3 text-black">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/historic-sites" className="flex items-center gap-2 text-black hover:text-primary transition-colors">
                  <MapPin className="w-4 h-4" />
                  Historic Sites
                </Link>
              </li>
              <li>
                <Link href="/how-to-use" className="flex items-center gap-2 text-black hover:text-primary transition-colors">
                  <HelpCircle className="w-4 h-4" />
                  How to Use
                </Link>
              </li>
              <li>
                <Link href="/contact" className="flex items-center gap-2 text-black hover:text-primary transition-colors">
                  <Mail className="w-4 h-4" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/contact#donate" className="flex items-center gap-2 text-black hover:text-primary transition-colors">
                  <Heart className="w-4 h-4" />
                  Support Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-3 text-black">Get in Touch</h3>
            <p className="text-sm text-gray-600 mb-3">
              Have questions, feedback, or want to contribute to our tours?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm text-black hover:text-primary transition-colors"
            >
              <Mail className="w-4 h-4" />
              Send us a message
            </Link>
          </div>
        </div>

        </div>

      {/* Copyright Bar */}
      <div className="bg-primary">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white">
            &copy; {currentYear} Southampton Village Walking Tour. All rights reserved.
          </p>
          <Link
            href="/admin"
            className="text-sm text-white hover:text-gray-300 transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
