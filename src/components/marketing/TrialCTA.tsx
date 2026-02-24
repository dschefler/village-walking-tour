'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronRight, X } from 'lucide-react';

interface TrialCTAProps {
  label?: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showArrow?: boolean;
  plan?: string;
}

export function TrialCTA({
  label = 'Start Free 7-Day Trial',
  className,
  size = 'default',
  variant = 'default',
  showArrow = false,
  plan,
}: TrialCTAProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/marketing/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'trial_cta', plan }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save');
      }
      router.push(`/signup?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        size={size}
        variant={variant}
        className={className}
        onClick={() => setOpen(true)}
      >
        {label}
        {showArrow && <ChevronRight className="w-5 h-5 ml-1" />}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative bg-background rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Start Your Free 7-Day Trial</h2>
              <p className="text-muted-foreground text-sm">
                Enter your email to get started. Full Pro features included — no credit card required.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                className="w-full border border-input rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'One moment…' : 'Continue to Sign Up →'}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              We&apos;ll use your email to follow up about your trial. No spam.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
