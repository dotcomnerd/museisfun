import React, { memo } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Song } from "muse-shared";

interface QueueSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queue: Song[];
  currentSong: Song;
  QueueItem: React.ComponentType<{
    song: Song & { _id: string };
    index: number;
    currentSongId: string;
    isPlaying: boolean;
  }>;
  isPlaying: boolean;
}

export const QueueSheet = memo(function QueueSheet({
  open,
  onOpenChange,
  queue,
  currentSong,
  QueueItem,
  isPlaying
}: QueueSheetProps) {
  // Memoize the currentSongId to prevent re-renders
  const currentSongId = currentSong?._id as string;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader className="px-6">
          <SheetTitle className="text-xl font-semibold">Up Next</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full px-6 my-2 pb-6">
          <div className="space-y-2">
            {queue.map((song, index) => (
              <QueueItem
                key={song._id}
                song={song as Song & { _id: string }}
                index={index}
                currentSongId={currentSongId}
                isPlaying={isPlaying}
              />
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
});
