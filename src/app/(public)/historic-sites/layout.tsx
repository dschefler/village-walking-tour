import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historic Sites',
  description:
    "Explore Southampton Village's historic sites and landmark buildings — photos, history, and audio stories on a free self-guided walking tour.",
  alternates: { canonical: 'https://southamptonwalkingtour.com/historic-sites' },
};

export default function HistoricSitesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
