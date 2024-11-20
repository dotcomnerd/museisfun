"use client";

import { useTrackContext } from "@/context/track-context";
import { useEffect } from "react";

export function useAudioPlayer() {

  const {
    currentTrack,
    setCurrentTrack,
    isPlaying,
    setIsPlaying,
    trackProgress,
    setTrackProgress,
    audioRef,
  } = useTrackContext()!;

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, audioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    const updateProgress = () => {
      if (currentTrack) {
        setTrackProgress((prev) => ({
          ...prev,
          [currentTrack.id]: (audio.currentTime / audio.duration) * 100,
        }));
      }
    };
    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, [currentTrack, audioRef, setTrackProgress]);

  const playTrack = (track: any) => {
    setCurrentTrack(track);
    audioRef.current.src = `/placeholder.mp3`;
    setIsPlaying(true);
    setTrackProgress((prev) => ({ ...prev, [track.id]: 0 }));
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  return {
    playTrack,
    togglePlayPause,
    currentTrack,
    isPlaying,
    trackProgress,
  };
}
