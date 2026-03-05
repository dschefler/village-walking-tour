import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Southampton Village Walking Tour',
    template: '%s | Southampton Village Walking Tour',
  },
  description: "Discover Southampton Village's history on a free self-guided GPS walking tour. Audio stops, fun facts, stamp card, and offline support — no download required.",
  keywords: [
    'Southampton walking tour',
    'Southampton Village historic district',
    'self-guided walking tour Southampton NY',
    'free walking tour app',
    'Southampton NY history',
    'historic district tour',
    'Long Island walking tour',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Southampton Tour',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Southampton Village Walking Tour',
    title: 'Southampton Village Walking Tour',
    description: "Discover Southampton Village's history on a free self-guided GPS walking tour.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Southampton Village Walking Tour',
    description: "Discover Southampton Village's history on a free self-guided GPS walking tour.",
  },
};

export const viewport: Viewport = {
  themeColor: '#A30000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
      </head>
      <body className={inter.className}>
        <OfflineIndicator />
        {children}
        <InstallPrompt />
        <Toaster />
      </body>
    </html>
  );
}
