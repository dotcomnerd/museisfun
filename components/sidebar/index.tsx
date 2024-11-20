"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigationStore } from "@/stores/nav";
import { Home, Library, PlusIcon, Search } from "lucide-react";

export function Sidebar() {
  const { currentView, changeView } = useNavigationStore();

  return (
    <aside className="w-60 bg-black p-6">
      <nav className="flex flex-col gap-y-4">
        <Button
          variant="ghost"
          className={`flex items-center justify-start gap-x-3 ${
            currentView === "home"
              ? "text-white bg-blue-500"
              : "text-gray-300 hover:text-black"
          }`}
          onClick={() => changeView("home")}
        >
          <Home size={24} />
          Home
        </Button>
        <Button
          variant="ghost"
          className={`flex items-center justify-start gap-x-3 ${
            currentView === "search"
              ? "text-white bg-blue-500"
              : "text-gray-300 hover:text-black"
          }`}
          onClick={() => changeView("search")}
        >
          <Search size={24} />
          Search
        </Button>
        <Button
          variant="ghost"
          className={`flex items-center justify-start gap-x-3 ${
            currentView === "library"
              ? "text-white bg-blue-500"
              : "text-gray-300 hover:text-black"
          }`}
          onClick={() => changeView("library")}
        >
          <Library size={24} />
          Your Library
        </Button>
      </nav>
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">PLAYLISTS</h2>
          <PlusIcon
            size={18}
            className="text-gray-300 hover:text-white cursor-pointer"
          />
        </div>
        <ScrollArea className="h-[calc(100vh-300px)] mt-4">
          <div className="flex flex-col gap-y-2">
            {Array.from({ length: 50 }, (_, i) => (
              <Button
                key={i}
                variant="ghost"
                className="justify-start"
                onClick={() => changeView(`playlist-${i + 1}`)}
              >
                My Playlist #{i + 1}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
