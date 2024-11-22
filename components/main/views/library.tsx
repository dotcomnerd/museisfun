"use client";

import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/hooks/use-audio";
import { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
};

const initialTracks: Track[] = [
  {
    id: "1",
    title: "Track 1",
    artist: "Artist 1",
    album: "Album 1",
    duration: "3:45",
  },
  {
    id: "2",
    title: "Track 2",
    artist: "Artist 2",
    album: "Album 2",
    duration: "4:20",
  },
  {
    id: "3",
    title: "Track 3",
    artist: "Artist 3",
    album: "Album 3",
    duration: "3:15",
  },
  {
    id: "4",
    title: "Track 4",
    artist: "Artist 4",
    album: "Album 4",
    duration: "5:10",
  },
];

export function LibraryView() {
  const [libraryTracks, setLibraryTracks] = useState<Track[]>(initialTracks);
  const { playTrack, trackProgress } = useAudioPlayer();

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
        <Button variant="ghost" className="mb-4">
          Add Track
        </Button>
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
                {libraryTracks.map((track, index) => (
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
                        <td className="py-2">{track.duration}</td>
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
