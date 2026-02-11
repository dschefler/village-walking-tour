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
  finalSiteId?: string; // ID of the final destination site
  onFinalDestinationReached?: (siteName: string) => void;
}

export function useProximityNotifications({
  sites,
  tourId,
  onAlert,
  checkIntervalMs = 5000,
  finalSiteId,
  onFinalDestinationReached,
}: UseProximityNotificationsOptions) {
  const { userLocation, isTracking, startTracking } = useGeolocation();
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
        const alert: ProximityAlert = {
          siteId: site.id,
          siteName: site.name,
          distance,
          timestamp: new Date().toISOString(),
          audioUrl: site.audio_url,
          transcript: site.description,
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

  // Start tracking when enabled
  useEffect(() => {
    if (enabled && !isTracking) {
      startTracking();
    }
  }, [enabled, isTracking, startTracking]);

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
