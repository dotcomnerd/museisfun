"use client";

import { Button } from "@/components/ui/button";
import { useNavigationStore } from "@/stores/nav";

export function HomeView() {
  const { changeView } = useNavigationStore();

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Good afternoon</h1>
      <div className="grid grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Button
            key={i}
            variant="secondary"
            className="flex items-center gap-x-4 h-20 bg-gray-800/50 hover:bg-gray-800"
            onClick={() => changeView(`playlist-${i + 1}`)}
          >
            <div className="w-16 h-16 bg-gray-500"></div>
            <span className="font-semibold">Playlist {i + 1}</span>
          </Button>
        ))}
      </div>
      <h2 className="text-2xl font-bold mt-10 mb-6">Made for You</h2>
      <div className="grid grid-cols-5 gap-6">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="bg-gray-800/40 p-4 rounded-lg hover:bg-gray-800/60 transition cursor-pointer"
            onClick={() => changeView(`daily-mix-${i + 1}`)}
          >
            <div className="w-full aspect-square bg-gray-500 mb-4"></div>
            <h3 className="font-semibold mb-2">Daily Mix {i + 1}</h3>
            <p className="text-sm text-gray-400">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
