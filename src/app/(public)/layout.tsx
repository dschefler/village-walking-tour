import { ContentVersionChecker } from '@/components/pwa/ContentVersionChecker';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { UpdatePrompt } from '@/components/pwa/UpdatePrompt';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ContentVersionChecker orgSlug="southampton" />
      <UpdatePrompt />
      <OfflineIndicator />
      {children}
      <InstallPrompt />
    </>
  );
}
