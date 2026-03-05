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

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceKey }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className={className}
      variant={variant}
      size={size}
    >
      {loading ? 'Redirecting...' : label}
    </Button>
  );
}
