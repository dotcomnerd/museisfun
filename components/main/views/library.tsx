"use client";

import { AddTrackDialog } from "@/components/dialogs/add-track";
import { useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { toDuration, type Track } from "@/lib/utils";
import { create } from "zustand";
import { Music, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioStore } from "@/stores/audio";

// Library store
interface LibraryState {
  tracks: Track[];
  setTracks: (tracks: Track[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const useLibraryStore = create<LibraryState>((set) => ({
  tracks: [],
  setTracks: (tracks) => set({ tracks }),
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));

// Utility for view transitions
const startViewTransition = (callback: () => void) => {
  if (document.startViewTransition) {
    document.startViewTransition(callback);
  } else {
    callback();
  }
};

export function LibraryView() {
  const { tracks, setTracks, isLoading, setIsLoading } = useLibraryStore();
  const audioStore = useAudioStore();

  // Destructure what we need from the audio store
  const { currentTrack, isPlaying, trackProgress, playTrack, togglePlayPause } =
    audioStore;

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await fetch("/api/get-tracks");
        const data = await res.json();

        if (!data.error) {
          startViewTransition(() => {
            setTracks(data);
            setIsLoading(false);
          });
        }
      } catch (error) {
        console.error("Error fetching tracks:", error);
        setIsLoading(false);
      }
    };

    fetchTracks();
  }, [setTracks, setIsLoading]);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tracks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    startViewTransition(() => {
      setTracks(items);
    });
  };

  const handleRowClick = (track: Track) => {
    startViewTransition(() => {
      playTrack(track);
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-4xl font-bold"
          style={{ viewTransitionName: "library-title" }}
        >
          Your Library
        </h1>
        <AddTrackDialog />
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="tracks">
          {(provided) => (
            <div
              className="bg-gray-900/50 rounded-lg overflow-hidden border border-gray-800"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-800">
                    <th className="p-4 w-16">#</th>
                    <th className="p-4">Title</th>
                    <th className="p-4">Artist</th>
                    <th className="p-4">Album</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4 w-32">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {tracks.map((track: Track, index) => {
                    const isCurrentTrack = currentTrack?.id === track.id;

                    return (
                      <Draggable
                        key={track.id}
                        draggableId={track.id}
                        index={index}
                      >
                        {(provided) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              group hover:bg-gray-800/40 transition-colors duration-200
                              ${isCurrentTrack ? "bg-gray-800/60" : ""}
                            `}
                            onClick={() => handleRowClick(track)}
                            style={{
                              ...provided.draggableProps.style,
                              viewTransitionName: `track-row-${track.id}`,
                            }}
                          >
                            <td className="p-4 w-16">
                              {isCurrentTrack ? (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    togglePlayPause();
                                  }}
                                >
                                  {isPlaying ? (
                                    <Pause
                                      size={16}
                                      className="text-green-500"
                                    />
                                  ) : (
                                    <Play
                                      size={16}
                                      className="text-green-500"
                                    />
                                  )}
                                </Button>
                              ) : (
                                <span className="text-gray-400 group-hover:invisible">
                                  {index + 1}
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {isCurrentTrack && isPlaying ? (
                                  <div className="flex items-end gap-0.5 h-3">
                                    <div className="w-0.5 h-full bg-green-500 animate-music-bar"></div>
                                    <div className="w-0.5 h-2/3 bg-green-500 animate-music-bar animation-delay-200"></div>
                                    <div className="w-0.5 h-1/3 bg-green-500 animate-music-bar animation-delay-400"></div>
                                  </div>
                                ) : (
                                  <Music size={16} className="text-gray-400" />
                                )}
                                <span
                                  className={
                                    isCurrentTrack ? "text-green-500" : ""
                                  }
                                >
                                  {track.title}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">{track.artist}</td>
                            <td className="p-4">{track.album}</td>
                            <td className="p-4">
                              {toDuration(track.duration)}
                            </td>
                            <td className="p-4 w-32">
                              <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-green-500 h-full transition-all duration-200"
                                  style={{
                                    width: `${trackProgress[track.id] || 0}%`,
                                  }}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </tbody>
              </table>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
