import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ListMusic, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Song } from "muse-shared";
import { ProgressBar } from "./progress-bar";

interface CollapsedPlayerProps {
  currentSong: Song;
  isPlaying: boolean;
  playPause: () => void;
  previousSong: () => void;
  nextSong: () => void;
  canPlayPrevious: boolean;
  canPlayNext: boolean;
  setShowQueue: (show: boolean) => void;
  setCollapsed: (collapsed: boolean) => void;
  duration: number;
  currentTime: number;
  bufferedTime: number;
  seek: (position: number) => void;
}

export const CollapsedPlayer = memo(function CollapsedPlayer({
  currentSong,
  isPlaying,
  playPause,
  previousSong,
  nextSong,
  canPlayPrevious,
  canPlayNext,
  setShowQueue,
  setCollapsed,
  duration,
  currentTime,
  bufferedTime,
  seek
}: CollapsedPlayerProps) {
  const handleShowQueue = useCallback(() => {
    setShowQueue(true);
  }, [setShowQueue]);

  const handleExpand = useCallback(() => {
    setCollapsed(false);
  }, [setCollapsed]);

  return (
    <div
      className="fixed bottom-0 right-0 p-2 flex items-center gap-2 bg-background/90 border rounded-tl-lg shadow-lg z-[100] rounded-tr-lg mr-4"
      style={{
        transform: 'translateY(0%)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        willChange: 'auto'
      }}
    >
      <img
        src={currentSong.thumbnail}
        alt={currentSong.title}
        className="w-8 h-8 rounded object-cover"
      />

      <Button
        size="sm"
        variant="ghost"
        onClick={previousSong}
        disabled={!canPlayPrevious}
        className="h-8 w-8"
      >
        <SkipBack className="w-4 h-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 rounded-full"
        onClick={playPause}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={nextSong}
        disabled={!canPlayNext}
        className="h-8 w-8"
      >
        <SkipForward className="w-4 h-4" />
      </Button>

      <div className="w-24 hidden md:block">
        <ProgressBar collapsed duration={duration} currentTime={currentTime} bufferedTime={bufferedTime} seek={seek} />
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={handleShowQueue}
        className="h-8"
      >
        <ListMusic className="w-4 h-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={handleExpand}
        className="h-8"
      >
        <ChevronUp className="w-4 h-4" />
      </Button>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if important values have changed
  return (
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.canPlayPrevious === nextProps.canPlayPrevious &&
    prevProps.canPlayNext === nextProps.canPlayNext &&
    prevProps.currentSong._id === nextProps.currentSong._id &&
    Math.floor(prevProps.currentTime) === Math.floor(nextProps.currentTime)
  );
});
