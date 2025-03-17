import React, { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, ListMusic, Minimize2, Volume2, VolumeX } from "lucide-react";
import { Song } from "muse-shared";
import { ProgressBar } from "./progress-bar";
import { ControlButtons } from "./control-buttons";

interface MobileExpandedViewProps {
  currentSong: Song;
  isPlaying: boolean;
  volume: number;
  setVolume: (volume: number) => void;
  setShowQueue: (show: boolean) => void;
  setIsMobileExpanded: (expanded: boolean) => void;
  setCollapsed: (collapsed: boolean) => void;
  headerRef: React.RefObject<HTMLDivElement>;
  duration: number;
  currentTime: number;
  bufferedTime: number;
  seek: (position: number) => void;
  playPause: () => void;
  previousSong: () => void;
  nextSong: () => void;
  canPlayPrevious: boolean;
  canPlayNext: boolean;
}

export const MobileExpandedView = memo(function MobileExpandedView({
  currentSong,
  isPlaying,
  volume,
  setVolume,
  setShowQueue,
  setIsMobileExpanded,
  setCollapsed,
  headerRef,
  duration,
  currentTime,
  bufferedTime,
  seek,
  playPause,
  previousSong,
  nextSong,
  canPlayPrevious,
  canPlayNext
}: MobileExpandedViewProps) {
  const handleClose = useCallback(() => {
    setIsMobileExpanded(false);
  }, [setIsMobileExpanded]);

  const handleShowQueue = useCallback(() => {
    setShowQueue(true);
  }, [setShowQueue]);

  const handleCollapse = useCallback(() => {
    setIsMobileExpanded(false);
    setCollapsed(true);
  }, [setIsMobileExpanded, setCollapsed]);

  const handleVolumeToggle = useCallback(() => {
    setVolume(volume === 0 ? 1 : 0);
  }, [volume, setVolume]);

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0] / 100);
  }, [setVolume]);

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      className="fixed inset-0 bg-background z-[100] flex flex-col h-[100dvh] will-change-transform"
      style={{
        top: 'env(safe-area-inset-top)',
        bottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <div className="sticky top-0 flex justify-between items-center p-4 bg-background/80 backdrop-blur-sm z-10 border-b" ref={headerRef}>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
        >
          <ChevronDown className="w-6 h-6" />
        </Button>
        <h2 className="font-semibold">Now Playing</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShowQueue}
          >
            <ListMusic className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCollapse}
          >
            <Minimize2 className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col px-4 py-8 md:py-12">
        <div className="flex flex-col items-center gap-8 md:gap-12">
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={currentSong.thumbnail}
            alt={currentSong.title}
            className="w-48 h-48 md:w-64 md:h-64 rounded-2xl object-cover shadow-xl"
          />

          <div className="text-center w-full max-w-sm">
            <h2 className="text-xl md:text-2xl font-semibold mb-2 line-clamp-2">
              {currentSong.title}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              {currentSong.uploader}
            </p>
          </div>

          <div className="w-full max-w-sm">
            <ProgressBar
              duration={duration}
              currentTime={currentTime}
              bufferedTime={bufferedTime}
              seek={seek}
            />
          </div>

          <div className="w-full max-w-sm space-y-8">
            <div className="flex justify-center gap-8">
              <ControlButtons
                isPlaying={isPlaying}
                playPause={playPause}
                previousSong={previousSong}
                nextSong={nextSong}
                canPlayPrevious={canPlayPrevious}
                canPlayNext={canPlayNext}
              />
            </div>

            <div className="flex items-center gap-6 px-2">
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
                className="flex-1"
              />
            </div>
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
