import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, ListMusic, Minimize2, Volume2, VolumeX } from "lucide-react";
import { Song } from "muse-shared";
import { ProgressBar } from "./progress-bar";
import { ControlButtons } from "./control-buttons";

interface DesktopExpandedViewProps {
  currentSong: Song;
  volume: number;
  setVolume: (volume: number) => void;
  setExpanded: (expanded: boolean) => void;
  setShowQueue: (show: boolean) => void;
  setCollapsed: (collapsed: boolean) => void;
  duration: number;
  currentTime: number;
  bufferedTime: number;
  seek: (position: number) => void;
  playPause: () => void;
  previousSong: () => void;
  nextSong: () => void;
  canPlayPrevious: boolean;
  canPlayNext: boolean;
  isPlaying: boolean;
}

export const DesktopExpandedView = memo(function DesktopExpandedView({
  currentSong,
  volume,
  setVolume,
  setExpanded,
  setShowQueue,
  setCollapsed,
  duration,
  currentTime,
  bufferedTime,
  seek,
  playPause,
  previousSong,
  nextSong,
  canPlayPrevious,
  canPlayNext,
  isPlaying
}: DesktopExpandedViewProps) {
  const handleClose = useCallback(() => {
    setExpanded(false);
  }, [setExpanded]);

  const handleShowQueue = useCallback(() => {
    setShowQueue(true);
  }, [setShowQueue]);

  const handleCollapse = useCallback(() => {
    setCollapsed(true);
  }, [setCollapsed]);

  const handleVolumeToggle = useCallback(() => {
    setVolume(volume === 0 ? 1 : 0);
  }, [volume, setVolume]);

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0] / 100);
  }, [setVolume]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col p-8 will-change-transform z-[100]"
    >
      <div className="flex justify-between items-center mb-8">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleClose}
        >
          <ChevronDown className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleShowQueue}
          >
            <ListMusic className="w-6 h-6" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCollapse}
          >
            <Minimize2 className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-lg mx-auto w-full">
        <motion.img
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={currentSong.thumbnail}
          alt={currentSong.title}
          className="w-64 h-64 rounded-2xl object-cover shadow-xl"
        />

        <div className="text-center w-full">
          <h2 className="text-xl font-semibold mb-2 whitespace-nowrap">
            {currentSong.title}
          </h2>
          <p className="text-muted-foreground">
            {currentSong.uploader}
          </p>
        </div>

        <ProgressBar
          duration={duration}
          currentTime={currentTime}
          bufferedTime={bufferedTime}
          seek={seek}
        />

        <div className="space-y-6 w-full flex flex-col items-center">
          <ControlButtons
            isPlaying={isPlaying}
            playPause={playPause}
            previousSong={previousSong}
            nextSong={nextSong}
            canPlayPrevious={canPlayPrevious}
            canPlayNext={canPlayNext}
          />

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVolumeToggle}
              className="text-muted-foreground hover:text-primary"
            >
              {volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            <Slider
              value={[volume * 100]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="w-32"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these important values have changed
  return (
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.currentSong._id === nextProps.currentSong._id &&
    Math.abs(prevProps.volume - nextProps.volume) < 0.01 &&
    Math.floor(prevProps.currentTime) === Math.floor(nextProps.currentTime) &&
    prevProps.canPlayPrevious === nextProps.canPlayPrevious &&
    prevProps.canPlayNext === nextProps.canPlayNext
  );
});
