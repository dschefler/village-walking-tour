'use client';

import { useState, useCallback } from 'react';
import { Download, Check, Loader2, WifiOff, Trash2, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { syncTourForOffline, getOfflineStatus } from '@/lib/offline/sync';
import { clearAllCache } from '@/lib/offline/db';
import { useToast } from '@/hooks/use-toast';

interface OfflineDownloadManagerProps {
  tourId: string;
  tourName: string;
}

export function OfflineDownloadManager({ tourId, tourName }: OfflineDownloadManagerProps) {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<{
    cachedTours: number;
    cachedSites: number;
    totalSizeEstimate: string;
  } | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const status = await getOfflineStatus();
      setCacheStatus(status);
      setDownloaded(status.cachedTours > 0);
    } catch (error) {
      console.error('Error checking cache status:', error);
    }
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      await syncTourForOffline(tourId);

      clearInterval(progressInterval);
      setProgress(100);
      setDownloaded(true);

      toast({
        title: 'Downloaded',
        description: `${tourName} is now available offline`,
      });

      // Update cache status
      await checkStatus();
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Unable to download tour for offline use',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await clearAllCache();
      setDownloaded(false);
      setCacheStatus(null);
      toast({
        title: 'Cache Cleared',
        description: 'Offline data has been removed',
      });
    } catch (error) {
      console.error('Clear cache error:', error);
      toast({
        title: 'Error',
        description: 'Unable to clear cache',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WifiOff className="w-5 h-5" />
          Offline Mode
        </CardTitle>
        <CardDescription>
          Download this tour to use it without an internet connection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {downloaded ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">
                  Available Offline
                </p>
                <p className="text-sm text-green-600 dark:text-green-500">
                  This tour can be accessed without internet
                </p>
              </div>
            </div>

            {cacheStatus && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HardDrive className="w-4 h-4" />
                <span>
                  {cacheStatus.cachedSites} locations cached ({cacheStatus.totalSizeEstimate})
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download className="w-4 h-4 mr-2" />
                Re-download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCache}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cache
              </Button>
            </div>
          </div>
        ) : downloading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Downloading tour data...</span>
            </div>
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground">
              Downloading images, audio, and location data
            </p>
          </div>
        ) : (
          <Button onClick={handleDownload} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download for Offline Use
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
