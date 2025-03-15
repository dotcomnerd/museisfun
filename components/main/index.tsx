"use client";

import { useNavigationStore } from "@/stores/nav";
import { Header } from "./header";
import { DailyMixView } from "./views/daily-mix";
import { HomeView } from "./views/home";
import { LibraryView } from "./views/library";
import { PlaylistView } from "./views/playlist";
import { SearchView } from "./views/search";

export function MainView() {
  const { currentView } = useNavigationStore();
  console.log(currentView);
  return (
    <main className="flex-1 bg-gradient-to-b from-gray-900 to-black p-8 overflow-auto">
      <Header />
      {currentView === "home" && <HomeView />}
      {currentView === "search" && <SearchView />}
      {currentView === "library" && <LibraryView />}
      {currentView.startsWith("playlist-") && (
        <PlaylistView id={currentView.split("-")[1]} />
      )}
      {currentView.startsWith("daily-mix-") && (
        <DailyMixView id={currentView.split("-")[2]} />
      )}
    </main>
  );
}
