import { create } from "zustand";

type SplashState = {
  statsLoaded: boolean;
  setStatsLoaded: (loaded: boolean) => void;
};

export const useSplashStore = create<SplashState>((set) => ({
  statsLoaded: false,
  setStatsLoaded: (loaded) => set({ statsLoaded: loaded }),
}));
