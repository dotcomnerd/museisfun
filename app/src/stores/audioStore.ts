import { Playlist } from "@/features/playlists/nested";
import { type Song } from "@/features/songs/dashboard/view";
import Fetcher from "@/lib/fetcher";
import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayerMode {
    isExpanded: boolean;
    isVisible: boolean;
    isMiniPlayer: boolean;
}

interface AudioState {
    // Playback state
    currentSong: Partial<Song> | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    bufferedTime: number;
    isBuffering: boolean;
    volume: number;

    // Queue state
    queue: Partial<Song>[];
    queueIndex: number;
    originalQueue: Partial<Song>[];
    isShuffled: boolean;
    isRepeating: boolean;
    autoPlayOnEnd: boolean;

    // Context state
    currentPlaylist: Playlist | null;
    playerMode: PlayerMode;
    searchTerm: string;

    // Listening time tracking
    listeningTimer: NodeJS.Timeout | null;
    lastUpdateTime: number;

    // Methods
    initializeAudio: (songs: Partial<Song>[], startIndex: number, playlist?: Partial<Playlist> | Playlist | null) => Promise<void> | void;
    play: () => void;
    pause: () => void;
    playPause: () => void;
    setSearchTerm: (searchTerm: string) => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    nextSong: () => void;
    previousSong: () => void;
    addToQueue: (song: Partial<Song>) => void;
    removeFromQueue: (index: number) => void;
    clearQueue: () => void;
    toggleShuffle: () => void;
    toggleRepeat: () => void;
    toggleAutoPlayOnEnd: () => void;
    setPlayerMode: (mode: Partial<PlayerMode>) => void;
    playQueueItem: (index: number) => void;
    updateListeningTime: (songId: string, time: number) => Promise<void>;
}

export function isFullPlaylist(playlist: Partial<Playlist> | Playlist): playlist is Playlist {
    return typeof playlist._id === "string";
}

export const useAudioStore = create<AudioState>()(
    persist(
        (set, get) => {
            let audioElement: HTMLAudioElement | null = null;
            let wakeLock: any = null;

            const requestWakeLock = async () => {
                try {
                    if ('wakeLock' in navigator) {
                        wakeLock = await (navigator as any).wakeLock.request('screen');
                    }
                } catch (err) {
                    console.error('Wake Lock error:', err);
                }
            };

            const releaseWakeLock = () => {
                if (wakeLock) {
                    wakeLock.release();
                    wakeLock = null;
                }
            };

            const updateMediaSession = (song: Partial<Song>) => {
                if ("mediaSession" in navigator) {
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: song.title || "",
                        artist: song.uploader || "",
                        artwork: [
                            { src: song.thumbnail || "", sizes: "96x96", type: "image/jpeg" },
                            { src: song.thumbnail || "", sizes: "128x128", type: "image/jpeg" },
                            { src: song.thumbnail || "", sizes: "192x192", type: "image/jpeg" },
                            { src: song.thumbnail || "", sizes: "256x256", type: "image/jpeg" },
                            { src: song.thumbnail || "", sizes: "384x384", type: "image/jpeg" },
                            { src: song.thumbnail || "", sizes: "512x512", type: "image/jpeg" }
                        ]
                    });

                    navigator.mediaSession.setActionHandler("play", () => get().play());
                    navigator.mediaSession.setActionHandler("pause", () => get().pause());
                    navigator.mediaSession.setActionHandler("previoustrack", () => get().previousSong());
                    navigator.mediaSession.setActionHandler("nexttrack", () => get().nextSong());
                    navigator.mediaSession.setActionHandler("seekbackward", (details) => {
                        if (audioElement) {
                            const skipTime = details?.seekOffset || 19;
                            const newTime = Math.max(audioElement.currentTime - skipTime, 0);

                            if (newTime === 0 && audioElement.currentTime < skipTime) {
                                get().previousSong();
                            } else {
                                get().seek(newTime);
                            }
                        }
                    });
                    navigator.mediaSession.setActionHandler("seekforward", (details) => {
                        if (audioElement) {
                            const skipTime = details?.seekOffset || 19;
                            const newTime = Math.min(audioElement.currentTime + skipTime, audioElement.duration);

                            if (newTime === audioElement.duration) {
                                get().nextSong();
                            } else {
                                get().seek(newTime);
                            }
                        }
                    });
                    navigator.mediaSession.setActionHandler("seekto", (details) => {
                        if (audioElement && details.seekTime !== undefined) {
                            const newTime = Math.max(0, Math.min(details.seekTime, audioElement.duration));
                            get().seek(newTime);
                        }
                    });
                    navigator.mediaSession.setActionHandler("stop", () => {
                        get().pause();
                        get().seek(0);
                    });
                }
            };

            const startListeningTimer = () => {
                const state = get();
                if (state.listeningTimer) clearInterval(state.listeningTimer);
                const timer = setInterval(() => {
                    const currentState = get();
                    if (currentState.currentSong && currentState.isPlaying) {
                        const currentTime = Date.now();
                        const timeDiff = (currentTime - currentState.lastUpdateTime) / 1000;

                        if (timeDiff >= 5) {
                            get().updateListeningTime(currentState.currentSong._id!, timeDiff);
                            set({ lastUpdateTime: currentTime });
                        }
                    }
                }, 5000);
                set({
                    listeningTimer: timer,
                    lastUpdateTime: Date.now()
                });
            };

            const stopListeningTimer = () => {
                const state = get();
                if (state.listeningTimer) {
                    clearInterval(state.listeningTimer);
                    set({ listeningTimer: null });

                    if (state.currentSong && state.isPlaying) {
                        const timeDiff = (Date.now() - state.lastUpdateTime) / 1000;
                        if (timeDiff > 0) {
                            get().updateListeningTime(state.currentSong._id!, timeDiff);
                        }
                    }
                }
            };

            const setupAudioElement = (song: Partial<Song>) => {
                if (audioElement) {
                    stopListeningTimer();
                    audioElement.pause();
                    audioElement.src = "";
                    audioElement.removeEventListener("timeupdate", timeUpdateHandler);
                    audioElement.removeEventListener("loadedmetadata", loadedMetadataHandler);
                    audioElement.removeEventListener("ended", endedHandler);
                    audioElement.removeEventListener("progress", progressHandler);
                    audioElement.removeEventListener("waiting", bufferingHandler);
                    audioElement.removeEventListener("playing", playingHandler);
                }

                audioElement = new Audio(song.stream_url!);
                audioElement.volume = get().volume;
                audioElement.preload = "auto";
                (audioElement as any).playsInline = true;

                audioElement.addEventListener('play', () => {
                    if (!audioElement) return;
                    try {
                        (audioElement as any).mozAudioChannelType = 'content';
                        (audioElement as any).preservesPitch = false;
                        audioElement.crossOrigin = "anonymous";
                    } catch (e) {
                        console.warn('Audio channel type not supported');
                    }
                });

                audioElement.addEventListener("timeupdate", timeUpdateHandler);
                audioElement.addEventListener("loadedmetadata", loadedMetadataHandler);
                audioElement.addEventListener("ended", endedHandler);
                audioElement.addEventListener("progress", progressHandler);
                audioElement.addEventListener("waiting", bufferingHandler);
                audioElement.addEventListener("playing", playingHandler);

                updateMediaSession(song);

                return audioElement;
            };

            const timeUpdateHandler = () => {
                if (audioElement) {
                    set({ currentTime: audioElement.currentTime });
                    if ("mediaSession" in navigator && !isNaN(audioElement.duration) && audioElement.duration > 0) {
                        navigator.mediaSession.setPositionState({
                            duration: audioElement.duration,
                            playbackRate: audioElement.playbackRate,
                            position: audioElement.currentTime
                        });
                    }
                }
            };

            const loadedMetadataHandler = () => {
                if (audioElement) set({ duration: audioElement.duration });
            };

            const progressHandler = () => {
                if (audioElement) {
                    const buffered = audioElement.buffered;
                    if (buffered.length > 0) {
                        set({ bufferedTime: buffered.end(0) });
                    }
                }
            };

            const bufferingHandler = () => set({ isBuffering: true });
            const playingHandler = () => {
                set({ isBuffering: false });
                if ("mediaSession" in navigator) {
                    navigator.mediaSession.playbackState = "playing";
                }
                requestWakeLock();
            };

            const endedHandler = () => {
                stopListeningTimer();
                const state = get();

                if (state.queueIndex === state.queue.length - 1) {
                    if ("mediaSession" in navigator) {
                        navigator.mediaSession.playbackState = "playing";
                    }
                    get().playQueueItem(0);
                } else {
                    if ("mediaSession" in navigator) {
                        navigator.mediaSession.playbackState = "playing";
                    }
                    get().nextSong();
                }
            };

            return {
                currentSong: null,
                isPlaying: false,
                currentTime: 0,
                duration: 0,
                searchTerm: "",
                bufferedTime: 0,
                isBuffering: false,
                volume: 1,
                queue: [],
                queueIndex: 0,
                originalQueue: [],
                isShuffled: false,
                isRepeating: false,
                autoPlayOnEnd: true,
                currentPlaylist: null,
                playerMode: {
                    isExpanded: false,
                    isVisible: true,
                    isMiniPlayer: true,
                },
                listeningTimer: null,
                lastUpdateTime: 0,

                initializeAudio: (songs, startIndex, playlist): Promise<void> | void => {
                    if (playlist && isFullPlaylist(playlist)) {
                        set({
                            queue: songs,
                            originalQueue: [...songs],
                            queueIndex: startIndex,
                            currentSong: songs[startIndex],
                            currentPlaylist: playlist,
                            isPlaying: false,
                            currentTime: 0,
                            playerMode: {
                                ...get().playerMode,
                                isVisible: true,
                            },
                        });
                    } else {
                        set({
                            queue: songs,
                            originalQueue: [...songs],
                            queueIndex: startIndex,
                            currentSong: songs[startIndex],
                            currentPlaylist: null,
                            isPlaying: false,
                            currentTime: 0,
                            playerMode: {
                                ...get().playerMode,
                                isVisible: true,
                            },
                        });
                    }

                    setupAudioElement(songs[startIndex]);

                    if (playlist) {
                        return (async () => {
                            await Fetcher.getInstance().post(`/api/playlists/${playlist._id}/play`).finally(async () => {
                                if (audioElement) {
                                    await audioElement.play().catch(() => set({ isPlaying: false }));
                                    set({ isPlaying: true });
                                    startListeningTimer();
                                }
                            });
                        })();
                    }

                    if (audioElement) {
                        audioElement.play().catch(() => {
                            set({ isPlaying: false });
                            stopListeningTimer();
                        });
                        set({ isPlaying: true });
                        startListeningTimer();
                    }
                },

                playQueueItem: (index: number) => {
                    const state = get();
                    const song = state.queue[index];
                    if (!song) return;

                    const audio = setupAudioElement(song);

                    if (!audio) return;

                    set({
                        currentSong: song,
                        queueIndex: index,
                        currentTime: 0,
                        isPlaying: true,
                    });

                    if ("mediaSession" in navigator) {
                        navigator.mediaSession.playbackState = "playing";
                    }

                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        playPromise.catch((error) => {
                            console.error("Playback failed:", error);
                            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                            if (isMobile) {
                                const retryPlay = () => {
                                    audio.play().then(() => {
                                        document.removeEventListener('touchend', retryPlay);
                                    }).catch(console.error);
                                };
                                document.addEventListener('touchend', retryPlay, { once: true });
                            }
                        });
                    }

                    startListeningTimer();
                },

                play: () => {
                    if (audioElement) {
                        const playPromise = audioElement.play();
                        if (playPromise !== undefined) {
                            playPromise
                                .then(() => {
                                    set({ isPlaying: true });
                                    startListeningTimer();
                                    if ("mediaSession" in navigator) {
                                        navigator.mediaSession.playbackState = "playing";
                                    }
                                })
                                .catch(() => set({ isPlaying: false }));
                        }
                    }
                },

                pause: () => {
                    if (audioElement) {
                        stopListeningTimer();
                        audioElement.pause();
                        set({ isPlaying: false });
                        if ("mediaSession" in navigator) {
                            navigator.mediaSession.playbackState = "paused";
                        }
                        releaseWakeLock();
                    }
                },

                playPause: () => {
                    const { isPlaying } = get();
                    if (isPlaying) {
                        get().pause();
                    } else {
                        get().play();
                    }
                },

                seek: (time) => {
                    if (audioElement) {
                        audioElement.currentTime = time;
                        set({ currentTime: time });
                        if ("mediaSession" in navigator) {
                            navigator.mediaSession.setPositionState({
                                duration: audioElement.duration,
                                playbackRate: audioElement.playbackRate,
                                position: time
                            });
                        }
                    }
                },

                setVolume: (volume) => {
                    if (audioElement) {
                        audioElement.volume = volume;
                        set({ volume });
                    }
                },

                nextSong: () => {
                    const state = get();
                    if (state.queueIndex < state.queue.length - 1) {
                        get().playQueueItem(state.queueIndex + 1);
                    } else {
                        if (state.autoPlayOnEnd) {
                            get().playQueueItem(0);
                        } else {
                            set({
                                queueIndex: 0,
                                currentSong: state.queue[0],
                                currentTime: 0,
                                isPlaying: false
                            });
                            setupAudioElement(state.queue[0]);
                        }
                    }
                },

                previousSong: () => {
                    const state = get();
                    if (audioElement) {
                        if (audioElement.currentTime > 19) {
                            get().seek(0);
                        } else if (state.queueIndex > 0) {
                            get().playQueueItem(state.queueIndex - 1);
                        } else {
                            get().seek(0);
                        }
                    }
                },

                toggleShuffle: () => {
                    const state = get();
                    const currentSong = state.queue[state.queueIndex];
                    const sourceSongs = state.currentPlaylist?.songs || state.originalQueue;

                    if (!state.isShuffled) {
                        const remainingSongs = sourceSongs
                            .filter(song => song._id !== currentSong._id)
                            .sort(() => Math.random() - 0.5);

                        set({
                            queue: [currentSong, ...remainingSongs],
                            queueIndex: 0,
                            isShuffled: true,
                        });
                    } else {
                        const newIndex = sourceSongs.findIndex(song => song._id === currentSong._id);
                        set({
                            queue: [...sourceSongs],
                            queueIndex: newIndex,
                            isShuffled: false,
                        });
                    }
                },

                toggleRepeat: () => set(state => ({ isRepeating: !state.isRepeating })),

                toggleAutoPlayOnEnd: () => set(state => ({ autoPlayOnEnd: !state.autoPlayOnEnd })),

                addToQueue: (song) => {
                    set(state => ({
                        queue: [...state.queue, song],
                        originalQueue: [...state.originalQueue, song],
                    }));
                },

                removeFromQueue: (index) => {
                    set(state => {
                        const newQueue = [...state.queue];
                        const newOriginalQueue = [...state.originalQueue];
                        newQueue.splice(index, 1);
                        newOriginalQueue.splice(index, 1);

                        return {
                            queue: newQueue,
                            originalQueue: newOriginalQueue,
                            queueIndex: index < state.queueIndex ? state.queueIndex - 1 : state.queueIndex,
                        };
                    });
                },

                clearQueue: () => {
                    stopListeningTimer();
                    if (audioElement) {
                        audioElement.pause();
                        audioElement.src = "";
                    }
                    set({
                        queue: [],
                        originalQueue: [],
                        queueIndex: 0,
                        currentSong: null,
                        currentPlaylist: null,
                        isPlaying: false,
                        currentTime: 0,
                        duration: 0,
                        playerMode: {
                            isExpanded: false,
                            isVisible: false,
                            isMiniPlayer: true,
                        },
                    });
                    if ("mediaSession" in navigator) {
                        navigator.mediaSession.playbackState = "none";
                    }
                    releaseWakeLock();
                },

                setSearchTerm: (searchTerm) => {
                    set({ searchTerm });
                },

                setPlayerMode: (mode) => {
                    set(state => ({
                        playerMode: {
                            ...state.playerMode,
                            ...mode,
                        },
                    }));
                },

                async updateListeningTime(songId, time) {
                    try {
                        await Fetcher.getInstance().post(`/api/songs/${songId}/listen`, { time });
                    } catch (error) {
                        console.error("Error updating listening time:", error);
                    }
                },
            };
        },
        {
            name: "audio-storage",
            partialize: (state) => ({
                volume: state.volume,
                isShuffled: state.isShuffled,
                isRepeating: state.isRepeating,
                autoPlayOnEnd: state.autoPlayOnEnd,
                playerMode: state.playerMode,
            }),
        }
    )
);

export function usePlayerControls() {
    const api = Fetcher.getInstance();
    const { data: allSongs } = useQuery({
        queryKey: ["songs"],
        queryFn: async () => {
            const res = await api.get<Song[]>("/api/songs");
            return res.data;
        },
    });

    const store = useAudioStore();
    const playSong = async (songId: string, playlistId?: string) => {
        try {
            if (playlistId) {
                const { data: playlist } = await api.get<Playlist>(`/api/playlists/${playlistId}`);
                const songIndex = playlist.songs.findIndex(song => song._id === songId);

                if (songIndex !== -1) {
                    store.initializeAudio(playlist.songs, songIndex, playlist);
                    store.play();
                    return;
                }
            }

            if (!allSongs) return;
            const songIndex = allSongs.findIndex(song => song._id === songId);
            if (songIndex === -1) return;

            store.initializeAudio(allSongs, songIndex, null);
            store.play();

        } catch (error) {
            console.error('Error playing song:', error);
            if (!allSongs) return;
            const songIndex = allSongs.findIndex(song => song._id === songId);
            if (songIndex === -1) return;

            store.initializeAudio(allSongs, songIndex, null);
            store.play();
        }
    };

    return { playSong };
}