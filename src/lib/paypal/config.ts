export const PAYPAL_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
  currency: 'USD',
  intent: 'capture' as const,
};

export function isPayPalConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID);
}

export interface PayPalOrderData {
  id: string;
  status: string;
  payer?: {
    name?: {
      given_name?: string;
      surname?: string;
    };
    email_address?: string;
  };
  purchase_units?: Array<{
    amount?: {
      value?: string;
      currency_code?: string;
    };
  }>;
}

export function formatAmountForPayPal(amountCents: number): string {
  return (amountCents / 100).toFixed(2);
}

export function parsePayPalAmount(amountString: string): number {
  return Math.round(parseFloat(amountString) * 100);
}
