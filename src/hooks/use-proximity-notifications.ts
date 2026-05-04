'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useGeolocation } from './use-geolocation';
import { useNotificationStore } from '@/stores/notification-store';
import { useTourStore } from '@/stores/tour-store';
import { calculateDistance } from '@/lib/utils';
import type { Site, ProximityAlert } from '@/types';

interface UseProximityNotificationsOptions {
  sites: Site[];
  tourId?: string;
  onAlert?: (alert: ProximityAlert) => void;
  checkIntervalMs?: number;
  finalSiteId?: string;
  onFinalDestinationReached?: (siteName: string) => void;
  // Provide the page's own GPS location to avoid a second watchPosition call
  externalUserLocation?: { latitude: number; longitude: number } | null;
}

export function useProximityNotifications({
  sites,
  tourId,
  onAlert,
  checkIntervalMs = 5000,
  finalSiteId,
  onFinalDestinationReached,
  externalUserLocation,
}: UseProximityNotificationsOptions) {
  const { userLocation: internalLocation, isTracking, startTracking } = useGeolocation();

  // Use the page's GPS if provided, otherwise fall back to internal tracking
  const hasExternal = externalUserLocation !== undefined;
  const userLocation = hasExternal ? externalUserLocation : internalLocation;
  const {
    enabled,
    radiusMeters,
    canAlertForSite,
    recordAlertTime,
    addAlert,
    triggerTourComplete,
  } = useNotificationStore();
  const { markSiteVisited } = useTourStore();

  const lastCheckRef = useRef<number>(0);
  const sitesRef = useRef(sites);
  sitesRef.current = sites;

  const checkProximity = useCallback(() => {
    if (!enabled || !userLocation) return;

    const now = Date.now();
    if (now - lastCheckRef.current < checkIntervalMs) return;
    lastCheckRef.current = now;

    for (const site of sitesRef.current) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        site.latitude,
        site.longitude
      );

      if (distance <= radiusMeters && canAlertForSite(site.id)) {
        // Extract primary image URL from site media if present (SiteItem passes media[])
        const siteWithMedia = site as Site & { media?: { storage_path: string; is_primary: boolean }[] };
        const primaryMedia = siteWithMedia.media?.find(m => m.is_primary) ?? siteWithMedia.media?.[0];
        const imageUrl = primaryMedia?.storage_path
          ? primaryMedia.storage_path.startsWith('http') || primaryMedia.storage_path.startsWith('/')
            ? primaryMedia.storage_path
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tour-media/${primaryMedia.storage_path}`
          : null;

        const alert: ProximityAlert = {
          siteId: site.id,
          siteName: site.name,
          distance,
          timestamp: new Date().toISOString(),
          audioUrl: site.audio_url,
          transcript: site.description,
          imageUrl,
        };

        recordAlertTime(site.id);
        addAlert(alert);
        onAlert?.(alert);

        // Auto-stamp the site as visited for the tour
        if (tourId) {
          markSiteVisited(tourId, site.id);
        }

        // Try to show native notification if supported
        showNativeNotification(alert);

        // Check if this is the final destination
        if (finalSiteId && site.id === finalSiteId) {
          // Trigger the tour complete prompt after a short delay
          setTimeout(() => {
            triggerTourComplete(site.name);
            onFinalDestinationReached?.(site.name);
          }, 2000);
        }
      }
    }
  }, [
    enabled,
    userLocation,
    radiusMeters,
    canAlertForSite,
    recordAlertTime,
    addAlert,
    onAlert,
    checkIntervalMs,
    finalSiteId,
    onFinalDestinationReached,
    triggerTourComplete,
    tourId,
    markSiteVisited,
  ]);

  // Only start internal tracking when no external location is provided
  useEffect(() => {
    if (hasExternal) return;
    if (enabled && !isTracking) {
      startTracking();
    }
  }, [hasExternal, enabled, isTracking, startTracking]);

  // Check proximity when location updates
  useEffect(() => {
    if (userLocation) {
      checkProximity();
    }
  }, [userLocation, checkProximity]);

  // Also check on interval
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(checkProximity, checkIntervalMs);
    return () => clearInterval(interval);
  }, [enabled, checkProximity, checkIntervalMs]);

  return {
    isTracking,
    userLocation,
  };
}

async function showNativeNotification(alert: ProximityAlert) {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  if (Notification.permission === 'granted') {
    const distanceText = alert.distance < 100
      ? `${Math.round(alert.distance)}m away`
      : `${(alert.distance / 1000).toFixed(1)}km away`;

    new Notification('Nearby Location', {
      body: `${alert.siteName} is ${distanceText}`,
      icon: '/icons/icon-192x192.png',
      tag: `proximity-${alert.siteId}`,
    });
  }
}

export function useRequestNotificationPermission() {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const result = await Notification.requestPermission();
    return result;
  }, []);

  return {
    requestPermission,
    permission:
      typeof window !== 'undefined' && 'Notification' in window
        ? Notification.permission
        : 'unsupported',
  };
}
