"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatTrackProgress, toDuration } from "@/lib/utils";
import { useAudioStore } from "@/stores/audio";
import {
  Laptop2,
  ListMusic,
  Maximize2,
  Mic2,
  Music,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { create } from "zustand";

const startViewTransition = (callback: () => void) => {
  if (document.startViewTransition) {
    document.startViewTransition(callback);
  } else {
    callback();
  }
};

interface PlayerUIState {
  image: string;
  setImage: (url: string) => void;
  previousTrack: { title: string; artist: string } | null;
  setPreviousTrack: (track: { title: string; artist: string } | null) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  previousVolume: number;
  setPreviousVolume: (volume: number) => void;
}

const usePlayerUIStore = create<PlayerUIState>((set) => ({
  image: "",
  setImage: (url) => set({ image: url }),
  previousTrack: null,
  setPreviousTrack: (track) => set({ previousTrack: track }),
  isMuted: false,
  setIsMuted: (muted) => set({ isMuted: muted }),
  previousVolume: 100,
  setPreviousVolume: (volume) => set({ previousVolume: volume }),
}));

export function Player() {
  const {
    image,
    setImage,
    previousTrack,
    setPreviousTrack,
    isMuted,
    setIsMuted,
    previousVolume,
    setPreviousVolume,
  } = usePlayerUIStore();

  const {
    currentTrack,
    isPlaying,
    trackProgress,
    volume,
    audioRef,
    togglePlayPause,
    seekToPosition,
    setVolume,
  } = useAudioStore();

  const handleProgressChange = (value: number[]) => {
    if (currentTrack) {
      seekToPosition(value[0]);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (!isMuted) {
        setPreviousVolume(volume);
        setVolume(0);
        setIsMuted(true);
      } else {
        setVolume(previousVolume);
        setIsMuted(false);
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (newVolume > 0) {
      setPreviousVolume(newVolume);
    }
  };

  useEffect(() => {
    if (currentTrack) {
      setImage(currentTrack.image_url!);
    }
  }, [currentTrack]);

  return (
    <footer className="h-20 bg-gray-900 border-t border-gray-800 p-4 flex items-center justify-between">
      <div className="flex items-center gap-x-4">
        <div
          className="w-20 h-14 relative overflow-hidden rounded-sm"
          style={{ viewTransitionName: "track-image" }}
        >
          {image ? (
            <Image
              src={image}
              alt="track image"
              fill
              className="object-cover transition-opacity duration-300"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <Music size={24} className="text-gray-600" />
            </div>
          )}
        </div>
        <div>
          <h4
            className="font-semibold text-sm"
            style={{ viewTransitionName: "track-title" }}
          >
            {currentTrack?.title || "No track selected"}
          </h4>
          <p
            className="text-xs text-gray-400"
            style={{ viewTransitionName: "track-artist" }}
          >
            {currentTrack?.artist || "Select a track to play"}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-y-2 min-w-xl">
        <div className="flex items-center gap-x-6">
          <Button
            size="icon"
            variant="ghost"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Shuffle size={20} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <SkipBack size={20} />
          </Button>
          <Button
            size="icon"
            className="bg-white text-black hover:bg-gray-100 rounded-full transition-all duration-200 active:scale-95 hover:scale-105"
            onClick={togglePlayPause}
            style={{ viewTransitionName: "play-button" }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <SkipForward size={20} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Repeat size={20} />
          </Button>
        </div>
        <div className="flex items-center gap-x-2 w-full">
          <span className="text-xs text-gray-400 min-w-[40px] text-right">
            {currentTrack?.duration
              ? formatTrackProgress(
                  trackProgress[currentTrack.id] || 0,
                  parseInt(currentTrack.duration)
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
          <span className="text-xs text-gray-400 min-w-[40px]">
            {currentTrack?.duration
              ? toDuration(currentTrack.duration)
              : "0:00"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-x-2">
        <Button
          size="icon"
          variant="ghost"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Mic2 size={20} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ListMusic size={20} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Laptop2 size={20} />
        </Button>
        <div className="flex items-center gap-x-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleMute}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={20} />
            ) : (
              <Volume size={20} />
            )}
          </Button>
          <Slider
            value={[volume]}
            max={100}
            step={1}
            className="w-20"
            onValueChange={handleVolumeChange}
          />
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Maximize2 size={20} />
        </Button>
      </div>
    </footer>
  );
}
