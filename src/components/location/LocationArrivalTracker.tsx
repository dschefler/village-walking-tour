'use client';

import { useProximityNotifications } from '@/hooks/use-proximity-notifications';
import { useNotificationStore } from '@/stores/notification-store';
import { ProximityNotificationContainer } from '@/components/pwa/ProximityNotification';
import { TourCompletePromptContainer } from '@/components/pwa/TourCompletePrompt';

interface LocationArrivalTrackerProps {
  locationId: string;
  locationName: string;
  latitude: number;
  longitude: number;
}

export function LocationArrivalTracker({
  locationId,
  locationName,
  latitude,
  longitude,
}: LocationArrivalTrackerProps) {
  const { enabled } = useNotificationStore();

  // Create a single-site array for proximity tracking
  const sites = [{
    id: locationId,
    name: locationName,
    latitude,
    longitude,
  }];

  // Track arrival at this single location
  useProximityNotifications({
    sites: sites as any[],
    finalSiteId: locationId, // Single location is always the final destination
    onFinalDestinationReached: (siteName) => {
      console.log('Arrived at location:', siteName);
    },
  });

  // Only render notification components if notifications are enabled
  if (!enabled) return null;

  return (
    <>
      <ProximityNotificationContainer />
      <TourCompletePromptContainer />
    </>
  );
}
