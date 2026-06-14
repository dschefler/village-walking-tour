import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Your Tour',
  description:
    'Build your own self-guided walking tour of Southampton Village — choose the historic sites you want to see and get a custom route with audio and directions.',
  alternates: { canonical: 'https://southamptonwalkingtour.com/create-your-tour' },
};

export default function CreateYourTourLayout({ children }: { children: React.ReactNode }) {
  return children;
}
