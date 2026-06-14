'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrialCTA } from '@/components/marketing/TrialCTA';

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/product" className="flex items-center gap-2" onClick={onClick}>
      <svg width="28" height="34" viewBox="0 0 28 34" fill="none" aria-hidden="true">
        <path d="M14 0C8.48 0 4 4.48 4 10c0 7.5 10 18 10 18S24 17.5 24 10c0-5.52-4.48-10-10-10z" fill="#1A6B5F" />
        <circle cx="14" cy="10" r="4" fill="white" opacity="0.85" />
        <circle cx="4" cy="26" r="1.8" fill="#CA7040" />
        <circle cx="9" cy="29" r="1.8" fill="#CA7040" />
        <circle cx="14" cy="31" r="1.8" fill="#CA7040" />
        <circle cx="19" cy="29" r="1.8" fill="#CA7040" />
        <circle cx="24" cy="26" r="1.8" fill="#CA7040" />
      </svg>
      <span className="font-bold text-base leading-tight">
        <span className="block text-[#1A6B5F]">Walking Tour</span>
        <span className="block text-[#CA7040]">Builder</span>
      </span>
    </Link>
  );
}

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 flex h-14 items-center justify-between">
        <Logo onClick={close} />

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="https://southamptonwalkingtour.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Live Demo
          </a>
          <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log In</Link>
          </Button>
          <TrialCTA label="Get Started" size="sm" />
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center p-2 -mr-2 text-foreground"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <a
              href="https://southamptonwalkingtour.com"
              target="_blank"
              rel="noopener noreferrer"
              className="py-1 text-sm text-muted-foreground hover:text-foreground"
              onClick={close}
            >
              Live Demo
            </a>
            <Link
              href="#pricing"
              className="py-1 text-sm text-muted-foreground hover:text-foreground"
              onClick={close}
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="py-1 text-sm text-muted-foreground hover:text-foreground"
              onClick={close}
            >
              Log In
            </Link>
            <div onClick={close}>
              <TrialCTA label="Get Started" size="default" className="w-full" />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
