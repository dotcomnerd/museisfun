import { createClient } from "@/lib/supabase/client";
import { type Track } from "@/lib/utils";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

const supabase = createClient();

interface AudioState {
  currentTrack: Track | null;
  isPlaying: boolean;
  trackProgress: Record<string, number>;
  audioRef: React.RefObject<HTMLAudioElement>;
  volume: number;
  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setTrackProgress: (progressUpdate: Record<string, number>) => void;
  setVolume: (volume: number) => void;
  playTrack: (track: Track) => Promise<void>;
  togglePlayPause: () => void;
  seekToPosition: (percentage: number) => void;
}

export const useAudioStore = create<AudioState>()(
  subscribeWithSelector((set, get) => ({
    currentTrack: null,
    isPlaying: false,
    trackProgress: {},
    audioRef: { current: null },
    volume: 70,

    setCurrentTrack: (track) => set({ currentTrack: track }),
    setIsPlaying: (playing) => set({ isPlaying: playing }),
    setTrackProgress: (progressUpdate) =>
      set({ trackProgress: progressUpdate }),
    setVolume: (volume) => set({ volume }),

    playTrack: async (track) => {
      const { audioRef } = get();
      if (!track || !audioRef.current) return;

      set({ currentTrack: track });

      if (!track.file_url) {
        throw new Error("File URL not found.");
      }

      audioRef.current.src = track.file_url;
      audioRef.current.play();

      set({ isPlaying: true });
      set((state) => ({
        trackProgress: {
          ...state.trackProgress,
          [track.id]: 0,
        },
      }));
    },

    togglePlayPause: () => {
      const { isPlaying, audioRef } = get();
      if (!audioRef.current) return;

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      set({ isPlaying: !isPlaying });
    },

    seekToPosition: (percentage) => {
      const { audioRef, currentTrack } = get();
      if (!audioRef.current || !currentTrack) return;

      const time = (percentage / 100) * audioRef.current.duration;
      if (!isFinite(time)) return;
      audioRef.current.currentTime = time;

      set((state) => ({
        trackProgress: {
          ...state.trackProgress,
          [currentTrack.id]: percentage,
        },
      }));
    },
  }))
);

// Set up subscribers for audio events
if (typeof window !== "undefined") {
  const audioElement = new Audio();
  useAudioStore.setState({ audioRef: { current: audioElement } });

  // Update progress
  audioElement.addEventListener("timeupdate", () => {
    const currentTrack = useAudioStore.getState().currentTrack;
    if (currentTrack && audioElement.duration > 0) {
      useAudioStore.setState((state) => ({
        trackProgress: {
          ...state.trackProgress,
          [currentTrack.id]:
            (audioElement.currentTime / audioElement.duration) * 100,
        },
      }));
    }
  });

  audioElement.addEventListener("ended", () => {
    useAudioStore.setState({ isPlaying: false });
  });

  audioElement.addEventListener("play", () => {
    useAudioStore.setState({ isPlaying: true });
  });

  audioElement.addEventListener("pause", () => {
    useAudioStore.setState({ isPlaying: false });
  });

  audioElement.volume = useAudioStore.getState().volume / 100;

  useAudioStore.subscribe(
    (state) => state.volume,
    (volume) => {
      audioElement.volume = volume / 100;
    }
  );
}
