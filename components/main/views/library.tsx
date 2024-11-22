"use client";

import { AddTrackDialog } from "@/components/dialogs/add-track";
import { useAudioPlayer } from "@/hooks/use-audio";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { type Track } from "@/lib/utils";

function toDuration(duration: string) {
  const minutes = Math.floor(Number(duration) / 60);
  const seconds = Number(duration) % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function LibraryView() {
  const [libraryTracks, setLibraryTracks] = useState<Track[]>([]);
  const { playTrack, trackProgress } = useAudioPlayer();

  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const fetchTracks = async () => {
      const res = await fetch("/api/get-tracks", {
        method: "GET",
      });

      const data = await res.json();
      if (!data.error) {
        setTracks(data);
      }
    };

    fetchTracks();
  }, []);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(libraryTracks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLibraryTracks(items);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold mb-6">Your Library</h1>
        <AddTrackDialog />
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="tracks">
          {(provided) => (
            <table
              className="w-full"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-2">#</th>
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Artist</th>
                  <th className="pb-2">Album</th>
                  <th className="pb-2">Duration</th>
                  <th className="pb-2 w-24">Progress</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map((track: Track, index) => (
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
                        className="hover:bg-gray-800/40 cursor-pointer"
                        onClick={() => playTrack(track)}
                      >
                        <td className="py-2">{index + 1}</td>
                        <td className="py-2 flex items-center gap-2">
                          <div className="flex items-end gap-0.5 h-3">
                            <div className="w-0.5 h-full bg-green-500 animate-music-bar"></div>
                            <div className="w-0.5 h-2/3 bg-green-500 animate-music-bar animation-delay-200"></div>
                            <div className="w-0.5 h-1/3 bg-green-500 animate-music-bar animation-delay-400"></div>
                          </div>
                          {track.title}
                        </td>
                        <td className="py-2">{track.artist}</td>
                        <td className="py-2">{track.album}</td>
                        <td className="py-2">{toDuration(track.duration)}</td>
                        <td className="py-2 w-24">
                          <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                            <div
                              className="bg-green-500 h-full"
                              style={{
                                width: `${trackProgress[track.id] || 0}%`,
                              }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            </table>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
