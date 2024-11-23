"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudioPlayer } from "@/hooks/use-audio";
import { formatTrackProgress, toDuration } from "@/lib/utils";
import {
  Laptop2,
  ListMusic,
  Maximize2,
  Mic2,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume,
} from "lucide-react";

export function Player() {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    trackProgress,
    seekToPosition,
  } = useAudioPlayer();

  const handleProgressChange = (value: number[]) => {
    if (currentTrack) {
      seekToPosition(value[0]);
    }
  };

  return (
    <footer className="h-20 bg-gray-900 border-t border-gray-800 p-4 flex items-center justify-between">
      <div className="flex items-center gap-x-4">
        <div className="w-14 h-14 bg-gray-500"></div>
        <div>
          <h4 className="font-semibold">
            {currentTrack?.title || "No track selected"}
          </h4>
          <p className="text-sm text-gray-400">
            {currentTrack?.artist || "Select a track to play"}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-y-2 flex-1 max-w-xl">
        <div className="flex items-center gap-x-6">
          <Button size="icon" variant="ghost">
            <Shuffle size={20} />
          </Button>
          <Button size="icon" variant="ghost">
            <SkipBack size={20} />
          </Button>
          <Button
            size="icon"
            className="bg-white text-black hover:bg-gray-100 rounded-full"
            onClick={togglePlayPause}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>
          <Button size="icon" variant="ghost">
            <SkipForward size={20} />
          </Button>
          <Button size="icon" variant="ghost">
            <Repeat size={20} />
          </Button>
        </div>
        <div className="flex items-center gap-x-2 w-full">
          <span className="text-xs text-gray-400">
            {currentTrack?.duration
              ? formatTrackProgress(
                  trackProgress[currentTrack?.id || ""] || 0,
                  currentTrack.duration
                )
              : "0:00"}
          </span>
          <Slider
            value={[trackProgress[currentTrack?.id || ""] || 0]}
            max={100}
            step={1}
            className="w-full"
            onValueChange={handleProgressChange}
          />
          <span className="text-xs text-gray-400">
            {currentTrack?.duration
              ? toDuration(currentTrack.duration)
              : "0:00"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-x-2">
        <Button size="icon" variant="ghost">
          <Mic2 size={20} />
        </Button>
        <Button size="icon" variant="ghost">
          <ListMusic size={20} />
        </Button>
        <Button size="icon" variant="ghost">
          <Laptop2 size={20} />
        </Button>
        <div className="flex items-center gap-x-2">
          <Volume size={20} />
          <Slider defaultValue={[66]} max={100} step={1} className="w-20" />
        </div>
        <Button size="icon" variant="ghost">
          <Maximize2 size={20} />
        </Button>
      </div>
    </footer>
  );
}