import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TourWithSites, Site, TourProgress } from '@/types';

interface TourState {
  currentTour: TourWithSites | null;
  selectedSite: Site | null;
  tourProgress: Record<string, TourProgress>;
  isNavigating: boolean;
  lastVisitedSiteId: string | null;
}

interface TourActions {
  setCurrentTour: (tour: TourWithSites | null) => void;
  setSelectedSite: (site: Site | null) => void;
  setIsNavigating: (isNavigating: boolean) => void;
  markSiteVisited: (tourId: string, siteId: string) => void;
  clearLastVisited: () => void;
  startTour: (tourId: string) => void;
  completeTour: (tourId: string) => void;
  resetTourProgress: (tourId: string) => void;
  getTourProgress: (tourId: string) => TourProgress | null;
}

export const useTourStore = create<TourState & TourActions>()(
  persist(
    (set, get) => ({
      currentTour: null,
      selectedSite: null,
      tourProgress: {},
      isNavigating: false,
      lastVisitedSiteId: null,

      setCurrentTour: (tour) => set({ currentTour: tour }),
      setSelectedSite: (site) => set({ selectedSite: site }),
      setIsNavigating: (isNavigating) => set({ isNavigating }),

      markSiteVisited: (tourId, siteId) =>
        set((state) => {
          const progress = state.tourProgress[tourId] || {
            tourId,
            visitedSites: [],
            currentSiteId: null,
            startedAt: null,
            completedAt: null,
          };

          if (progress.visitedSites.includes(siteId)) {
            return state;
          }

          return {
            lastVisitedSiteId: siteId,
            tourProgress: {
              ...state.tourProgress,
              [tourId]: {
                ...progress,
                visitedSites: [...progress.visitedSites, siteId],
                currentSiteId: siteId,
              },
            },
          };
        }),

      clearLastVisited: () => set({ lastVisitedSiteId: null }),

      startTour: (tourId) =>
        set((state) => ({
          tourProgress: {
            ...state.tourProgress,
            [tourId]: {
              tourId,
              visitedSites: [],
              currentSiteId: null,
              startedAt: new Date().toISOString(),
              completedAt: null,
            },
          },
        })),

      completeTour: (tourId) =>
        set((state) => {
          const progress = state.tourProgress[tourId];
          if (!progress) return state;

          return {
            tourProgress: {
              ...state.tourProgress,
              [tourId]: {
                ...progress,
                completedAt: new Date().toISOString(),
              },
            },
          };
        }),

      resetTourProgress: (tourId) =>
        set((state) => {
          const { [tourId]: _, ...rest } = state.tourProgress;
          return { tourProgress: rest };
        }),

      getTourProgress: (tourId) => get().tourProgress[tourId] || null,
    }),
    {
      name: 'tour-progress',
      partialize: (state) => ({ tourProgress: state.tourProgress }),
    }
  )
);
