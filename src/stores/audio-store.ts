import { create } from 'zustand';

interface AudioState {
  isPlaying: boolean;
  currentSiteId: string | null;
  progress: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
}

interface AudioActions {
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentSiteId: (siteId: string | null) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: AudioState = {
  isPlaying: false,
  currentSiteId: null,
  progress: 0,
  duration: 0,
  isLoading: false,
  error: null,
};

export const useAudioStore = create<AudioState & AudioActions>((set) => ({
  ...initialState,

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentSiteId: (currentSiteId) => set({ currentSiteId }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
