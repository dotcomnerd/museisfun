"use client";

import { useState, useCallback } from "react";

export function useNavigation() {
  const [currentView, setCurrentView] = useState("home");
  const [navigationHistory, setNavigationHistory] = useState(["home"]);

  const startViewTransition = useCallback((callback: () => void) => {
    if (document.startViewTransition) {
      document.startViewTransition(callback);
    } else {
      callback();
    }
  }, []);

  const changeView = useCallback(
    (view: string) => {
      startViewTransition(() => {
        setCurrentView(view);
        setNavigationHistory((prev) => [...prev, view]);
      });
    },
    [startViewTransition]
  );

  const goBack = useCallback(() => {
    if (navigationHistory.length > 1) {
      startViewTransition(() => {
        const newHistory = [...navigationHistory];
        newHistory.pop();
        const previousView = newHistory[newHistory.length - 1];
        setCurrentView(previousView);
        setNavigationHistory(newHistory);
      });
    }
  }, [navigationHistory, startViewTransition]);

  return {
    currentView,
    navigationHistory,
    changeView,
    goBack,
  };
}
