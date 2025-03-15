"use client";

import { Track } from "@/lib/utils";
import { createContext, useContext, useEffect, useRef, useState } from "react";

interface TrackContextType {
  currentTrack: Track | null;
  setCurrentTrack: React.Dispatch<React.SetStateAction<any>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  trackProgress: {
    [key: string]: number;
  };
  setTrackProgress: React.Dispatch<React.SetStateAction<{}>>;
  audioRef: React.MutableRefObject<HTMLAudioElement | undefined>;
}

const TrackContext = createContext<TrackContextType | null>(null);

export function TrackProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackProgress, setTrackProgress] = useState({});
  const audio = useRef<HTMLAudioElement | undefined>(undefined);

  useEffect(() => {
    audio.current = new Audio();
    return () => {
      audio.current?.pause();
      audio.current = undefined;
    };
  }, []);

  const value = {
    currentTrack,
    setCurrentTrack,
    isPlaying,
    setIsPlaying,
    trackProgress,
    setTrackProgress,
    audioRef: audio,
  };

  return (
    <TrackContext.Provider value={value}>{children}</TrackContext.Provider>
  );
}

export const useTrackContext = () => useContext(TrackContext);
