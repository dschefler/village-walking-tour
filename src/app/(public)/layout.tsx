import { ContentVersionChecker } from '@/components/pwa/ContentVersionChecker';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ContentVersionChecker orgSlug="southampton" />
      {children}
    </>
  );
}
