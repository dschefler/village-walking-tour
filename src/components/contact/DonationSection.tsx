'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StripePayment } from './StripePayment';
import { PayPalButton } from './PayPalButton';
import { cn } from '@/lib/utils';

const DEFAULT_DONATION_DOLLARS = [5, 10, 20, 50];

interface DonationSectionProps {
  className?: string;
  /** Preset donation amounts in dollars, e.g. [5, 10, 25, 50]. Defaults to [5, 10, 20, 50]. */
  amounts?: number[];
}

export function DonationSection({ className, amounts }: DonationSectionProps) {
  const dollarAmounts = (amounts && amounts.length > 0) ? amounts : DEFAULT_DONATION_DOLLARS;
  const donationAmounts = dollarAmounts.map((d) => ({ value: d * 100, label: `$${d}` }));
  const [selectedAmount, setSelectedAmount] = useState<number>(donationAmounts[1]?.value ?? donationAmounts[0]?.value ?? 1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | null>(null);

  const actualAmount = customAmount
    ? Math.round(parseFloat(customAmount) * 100)
    : selectedAmount;

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setCustomAmount(value);
    }
  };

  return (
    <Card id="donate" className={cn('scroll-mt-20', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Support Us
        </CardTitle>
        <CardDescription>
          Help us maintain and improve our walking tours. Your donation supports
          content creation, audio production, and keeping this app free for everyone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Selection */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Select an amount</p>
          <div className="grid grid-cols-4 gap-2">
            {donationAmounts.map(({ value, label }) => (
              <Button
                key={value}
                type="button"
                variant={selectedAmount === value && !customAmount ? 'default' : 'outline'}
                onClick={() => handleAmountSelect(value)}
                className="w-full"
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">or</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Custom amount"
                className={cn(
                  'w-full pl-7 pr-3 py-2 border rounded-md',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  customAmount && 'border-primary'
                )}
              />
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        {actualAmount > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">
              Donate{' '}
              <span className="text-primary">
                ${(actualAmount / 100).toFixed(2)}
              </span>
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <Button
                variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('stripe')}
                className="w-full"
              >
                Pay with Card
              </Button>
              <Button
                variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('paypal')}
                className="w-full"
              >
                Pay with PayPal
              </Button>
            </div>
          </div>
        )}

        {/* Payment Form */}
        {paymentMethod === 'stripe' && (
          <StripePayment
            amountCents={actualAmount}
            onSuccess={() => setPaymentMethod(null)}
          />
        )}

        {paymentMethod === 'paypal' && (
          <PayPalButton
            amountCents={actualAmount}
            onSuccess={() => setPaymentMethod(null)}
          />
        )}

        {/* Security Note */}
        <p className="text-xs text-muted-foreground text-center">
          Payments are securely processed. We never store your card details.
        </p>
      </CardContent>
    </Card>
  );
}
