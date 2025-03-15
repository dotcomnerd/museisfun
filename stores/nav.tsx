import { create } from "zustand";

type NavigationState = {
  currentView: string;
  navigationHistory: string[];
  changeView: (view: string) => void;
  goBack: () => void;
};

export const useNavigationStore = create<NavigationState>((set) => ({
  currentView: "home",
  navigationHistory: ["home"],
  changeView: (view) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        set((state) => ({
          currentView: view,
          navigationHistory: [...state.navigationHistory, view],
        }));
      });
    } else {
      set((state) => ({
        currentView: view,
        navigationHistory: [...state.navigationHistory, view],
      }));
    }
  },
  goBack: () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        set((state) => {
          if (state.navigationHistory.length <= 1) return state;
          const newHistory = [...state.navigationHistory];
          newHistory.pop();
          return {
            currentView: newHistory[newHistory.length - 1],
            navigationHistory: newHistory,
          };
        });
      });
    } else {
      set((state) => {
        if (state.navigationHistory.length <= 1) return state;
        const newHistory = [...state.navigationHistory];
        newHistory.pop();
        return {
          currentView: newHistory[newHistory.length - 1],
          navigationHistory: newHistory,
        };
      });
    }
  },
}));
