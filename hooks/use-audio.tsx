"use client";

import { useTrackContext } from "@/context/track-context";
import { createClient } from "@/lib/supabase/client";
import { type Track } from "@/lib/utils";
import { useEffect } from "react";

const supabase = createClient();

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
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, audioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
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

  const playTrack = async (track: Track) => {
    if (!track) return;
    if (!audioRef.current) return;
    setCurrentTrack(track);
    if (!track.file_url) {
      throw new Error("File URL not found.");
    }

    const { data, error } = await supabase.storage
      .from("audio")
      .createSignedUrl(track.file_url, 60);
    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Signed URL not found.");
    }

    audioRef.current.src = data.signedUrl;
    audioRef.current.play();

    setIsPlaying(true);
    setTrackProgress((prev) => ({
      ...prev,
      [track.id]: 0,
    }));
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
