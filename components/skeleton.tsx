"use client";

import { TrackProvider } from "@/context/track-context";
import { MainView } from "./main";
import { Player } from "./player";
import { Sidebar } from "./sidebar";

export function SkeletonLayout() {
  return (
    <TrackProvider>
      <div className="h-screen flex flex-col bg-black text-white">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <MainView />
        </div>
        <Player />
      </div>
    </TrackProvider>
  );
}
