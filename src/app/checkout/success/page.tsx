import Link from 'next/link';
import { CheckCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const isSubscription = searchParams.type === 'subscription';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-full">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-3">
          {isSubscription ? 'Your Trial Has Started!' : 'Order Confirmed!'}
        </h1>

        {isSubscription ? (
          <>
            <p className="text-muted-foreground mb-6">
              You have <strong>7 days free</strong> to explore everything. No charge until your trial ends — and you can cancel any time.
            </p>
            <div className="bg-muted/40 rounded-xl p-5 mb-8 text-left space-y-2">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Check your email — we&apos;ll send your login link and setup instructions shortly.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-muted-foreground mb-6">
              Thank you for your purchase! Our team will be in touch within 1 business day to kick off your project.
            </p>
            <div className="bg-muted/40 rounded-xl p-5 mb-8 text-left space-y-2">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Check your email for a confirmation and next steps. To get started faster, gather your branding materials, content, and photos.
                </p>
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/login">Log In to Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/product">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
