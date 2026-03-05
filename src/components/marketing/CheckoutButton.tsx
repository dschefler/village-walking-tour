'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { PriceKey } from '@/lib/stripe';

interface CheckoutButtonProps {
  priceKey: PriceKey;
  label?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function CheckoutButton({
  priceKey,
  label = 'Get Started',
  className,
  variant = 'default',
  size = 'default',
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceKey }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        onClick={handleClick}
        disabled={loading}
        className={className}
        variant={variant}
        size={size}
      >
        {loading ? 'Redirecting...' : label}
      </Button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
