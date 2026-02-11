import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProximityAlert } from '@/types';

interface NotificationState {
  // Settings
  enabled: boolean;
  radiusMeters: number;

  // Recent alerts
  recentAlerts: ProximityAlert[];
  dismissedAlertIds: Set<string>;

  // Last alert time per site (for debouncing)
  lastAlertTime: Record<string, number>;

  // Tour completion state
  showTourCompletePrompt: boolean;
  completedSiteName: string | null;

  // Actions
  setEnabled: (enabled: boolean) => void;
  setRadiusMeters: (radius: number) => void;
  addAlert: (alert: ProximityAlert) => void;
  dismissAlert: (siteId: string) => void;
  clearAlerts: () => void;
  canAlertForSite: (siteId: string, debounceMs?: number) => boolean;
  recordAlertTime: (siteId: string) => void;
  triggerTourComplete: (siteName: string) => void;
  dismissTourComplete: () => void;
}

// Default debounce time: 30 seconds
const DEFAULT_DEBOUNCE_MS = 30000;

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // Settings
      enabled: false,
      radiusMeters: 100,

      // State
      recentAlerts: [],
      dismissedAlertIds: new Set(),
      lastAlertTime: {},

      // Tour completion state
      showTourCompletePrompt: false,
      completedSiteName: null,

      // Actions
      setEnabled: (enabled) => set({ enabled }),

      setRadiusMeters: (radius) =>
        set({ radiusMeters: Math.max(10, Math.min(1000, radius)) }),

      addAlert: (alert) =>
        set((state) => ({
          recentAlerts: [alert, ...state.recentAlerts.slice(0, 9)], // Keep last 10
        })),

      dismissAlert: (siteId) =>
        set((state) => ({
          dismissedAlertIds: new Set(Array.from(state.dismissedAlertIds).concat(siteId)),
          recentAlerts: state.recentAlerts.filter((a) => a.siteId !== siteId),
        })),

      clearAlerts: () =>
        set({
          recentAlerts: [],
          dismissedAlertIds: new Set(),
          lastAlertTime: {},
        }),

      canAlertForSite: (siteId, debounceMs = DEFAULT_DEBOUNCE_MS) => {
        const state = get();

        // Check if notifications are enabled
        if (!state.enabled) return false;

        // Check if dismissed
        if (state.dismissedAlertIds.has(siteId)) return false;

        // Check debounce
        const lastTime = state.lastAlertTime[siteId];
        if (lastTime && Date.now() - lastTime < debounceMs) {
          return false;
        }

        return true;
      },

      recordAlertTime: (siteId) =>
        set((state) => ({
          lastAlertTime: {
            ...state.lastAlertTime,
            [siteId]: Date.now(),
          },
        })),

      triggerTourComplete: (siteName) =>
        set({
          showTourCompletePrompt: true,
          completedSiteName: siteName,
        }),

      dismissTourComplete: () =>
        set({
          showTourCompletePrompt: false,
          completedSiteName: null,
        }),
    }),
    {
      name: 'notification-preferences',
      partialize: (state) => ({
        enabled: state.enabled,
        radiusMeters: state.radiusMeters,
        dismissedAlertIds: Array.from(state.dismissedAlertIds),
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.dismissedAlertIds)) {
          state.dismissedAlertIds = new Set(state.dismissedAlertIds as unknown as string[]);
        }
      },
    }
  )
);
