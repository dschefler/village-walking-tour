'use client';

import { useState, useEffect } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStripe, createPaymentIntent } from '@/lib/stripe/client';
import { useToast } from '@/hooks/use-toast';

interface StripePaymentProps {
  amountCents: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

function CheckoutForm({
  amountCents,
  onSuccess,
  onError,
}: StripePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/contact?donation=success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: 'Payment Failed',
          description: error.message,
          variant: 'destructive',
        });
        onError?.(error.message || 'Payment failed');
      } else if (paymentIntent?.status === 'succeeded') {
        setSucceeded(true);
        toast({
          title: 'Thank You!',
          description: `Your donation of $${(amountCents / 100).toFixed(2)} has been received.`,
        });
        onSuccess?.();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      onError?.(message);
    } finally {
      setProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <div className="text-center py-6">
        <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
        <p className="font-semibold">Thank you for your donation!</p>
        <p className="text-sm text-muted-foreground mt-1">
          Your support helps us improve our walking tours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          `Donate $${(amountCents / 100).toFixed(2)}`
        )}
      </Button>
    </form>
  );
}

export function StripePayment(props: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initPayment() {
      try {
        setLoading(true);
        setError(null);
        const { clientSecret } = await createPaymentIntent(props.amountCents);
        setClientSecret(clientSecret);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize payment';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    if (props.amountCents > 0) {
      initPayment();
    }
  }, [props.amountCents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg">
        <AlertCircle className="w-5 h-5 text-destructive" />
        <div>
          <p className="font-medium text-destructive">Payment Unavailable</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  const stripePromise = getStripe();

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#2563eb',
          },
        },
      }}
    >
      <CheckoutForm {...props} />
    </Elements>
  );
}
