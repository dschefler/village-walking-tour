'use client';

import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useOffline } from '@/hooks/use-offline';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const { isOnline } = useOffline();

  if (isOnline) return null;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'bg-amber-500 text-amber-950 px-4 py-2',
        'flex items-center justify-center gap-2 text-sm font-medium',
        className
      )}
    >
      <WifiOff className="w-4 h-4" />
      <span>You&apos;re offline. Some features may be limited.</span>
    </div>
  );
}

export function ConnectionStatus({ className }: { className?: string }) {
  const { isOnline } = useOffline();

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4 text-green-500" />
          <span className="text-muted-foreground">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-amber-500" />
          <span className="text-amber-600">Offline</span>
        </>
      )}
    </div>
  );
}

export function SyncButton({
  onSync,
  isSyncing,
  className,
}: {
  onSync: () => void;
  isSyncing: boolean;
  className?: string;
}) {
  const { isOnline } = useOffline();

  return (
    <button
      onClick={onSync}
      disabled={!isOnline || isSyncing}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
        'bg-secondary hover:bg-secondary/80 transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      <RefreshCw className={cn('w-4 h-4', isSyncing && 'animate-spin')} />
      <span>{isSyncing ? 'Syncing...' : 'Sync for Offline'}</span>
    </button>
  );
}
