import { create } from "zustand";

interface LoadingState {
  isLoading: boolean;
  progress: number;
  statsDataLoaded: boolean;
  setLoading: (isLoading: boolean) => void;
  setProgress: (progress: number) => void;
  startLoading: () => void;
  finishLoading: () => void;
  setStatsDataLoaded: (loaded: boolean) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: true,
  progress: 0,
  statsDataLoaded: false,
  setLoading: (isLoading) => set({ isLoading }),
  setProgress: (progress) => set({ progress: progress > 1 ? 1 : progress < 0 ? 0 : progress }),
  startLoading: () => set({ isLoading: true, progress: 0 }),
  finishLoading: () => set({ isLoading: false, progress: 1 }),
  setStatsDataLoaded: (loaded) => set({ statsDataLoaded: loaded }),
}));
