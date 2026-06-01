import type { Metadata } from 'next';

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/icons/wtb-favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/wtb-favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/icons/wtb-apple-touch-icon.png',
  },
  openGraph: {
    images: [
      {
        url: '/images/wtb-og-image.png',
        width: 1200,
        height: 630,
        alt: 'Walking Tour Builder — Build GPS walking tour apps in minutes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/wtb-og-image.png'],
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .wtb-theme {
              --primary: 177 82% 24%;
              --primary-foreground: 0 0% 100%;
              --accent: 20 66% 56%;
              --accent-foreground: 0 0% 100%;
              --ring: 177 82% 24%;
            }
          `,
        }}
      />
      <div className="wtb-theme">{children}</div>
    </>
  );
}
