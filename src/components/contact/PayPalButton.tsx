'use client';

import { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { PAYPAL_CONFIG, isPayPalConfigured, formatAmountForPayPal } from '@/lib/paypal/config';
import { useToast } from '@/hooks/use-toast';

interface PayPalButtonProps {
  amountCents: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

function PayPalButtonInner({ amountCents, onSuccess, onError }: PayPalButtonProps) {
  const { toast } = useToast();
  const [succeeded, setSucceeded] = useState(false);

  const amount = formatAmountForPayPal(amountCents);

  if (succeeded) {
    return (
      <div className="text-center py-6">
        <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
        <p className="font-semibold">Thank you for your donation!</p>
        <p className="text-sm text-muted-foreground mt-1">
          Your PayPal payment has been received.
        </p>
      </div>
    );
  }

  return (
    <PayPalButtons
      style={{
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'donate',
      }}
      createOrder={(_data, actions) => {
        return actions.order.create({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                value: amount,
                currency_code: PAYPAL_CONFIG.currency,
              },
              description: 'Donation to Village Walking Tours',
            },
          ],
        });
      }}
      onApprove={async (_data, actions) => {
        try {
          const details = await actions.order?.capture();

          if (details?.status === 'COMPLETED') {
            setSucceeded(true);
            toast({
              title: 'Thank You!',
              description: `Your donation of $${amount} has been received via PayPal.`,
            });

            // Record the donation
            await fetch('/api/donations/webhook', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                provider: 'paypal',
                orderId: details.id,
                amount: amountCents,
                currency: PAYPAL_CONFIG.currency,
                payerEmail: details.payer?.email_address,
                payerName: details.payer?.name
                  ? `${details.payer.name.given_name || ''} ${details.payer.name.surname || ''}`.trim()
                  : undefined,
              }),
            });

            onSuccess?.();
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Payment failed';
          toast({
            title: 'Payment Error',
            description: message,
            variant: 'destructive',
          });
          onError?.(message);
        }
      }}
      onError={(err) => {
        console.error('PayPal error:', err);
        toast({
          title: 'PayPal Error',
          description: 'An error occurred with PayPal. Please try again.',
          variant: 'destructive',
        });
        onError?.('PayPal error');
      }}
      onCancel={() => {
        toast({
          title: 'Payment Cancelled',
          description: 'You cancelled the PayPal payment.',
        });
      }}
    />
  );
}

export function PayPalButton(props: PayPalButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isPayPalConfigured()) {
    return (
      <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg">
        <AlertCircle className="w-5 h-5 text-destructive" />
        <div>
          <p className="font-medium text-destructive">PayPal Unavailable</p>
          <p className="text-sm text-muted-foreground">
            PayPal is not configured. Please use card payment instead.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CONFIG.clientId,
        currency: PAYPAL_CONFIG.currency,
        intent: PAYPAL_CONFIG.intent,
      }}
    >
      <PayPalButtonInner {...props} />
    </PayPalScriptProvider>
  );
}
