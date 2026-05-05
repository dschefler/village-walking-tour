'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TourBuilderStore {
  pendingIds: string[];
  toggle: (id: string) => void;
  setIds: (ids: string[]) => void;
  clear: () => void;
}

export const useTourBuilderStore = create<TourBuilderStore>()(
  persist(
    (set, get) => ({
      pendingIds: [],
      toggle: (id: string) => {
        const ids = get().pendingIds;
        set({ pendingIds: ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id] });
      },
      setIds: (ids: string[]) => set({ pendingIds: ids }),
      clear: () => set({ pendingIds: [] }),
    }),
    { name: 'tour-builder-pending' }
  )
);
