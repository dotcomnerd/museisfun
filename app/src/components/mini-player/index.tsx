import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAudioStore } from "@/stores/audioStore";
import { toast } from "sonner";
import { Song } from "muse-shared";
import { Button } from "@/components/ui/button";
import { Minimize2 } from "lucide-react";

import { EmptyState } from "./empty-state";
import { ProgressBar } from "./progress-bar";
import { ControlButtons } from "./control-buttons";
import { QueueItem } from "./queue-item";
import { CollapsedPlayer } from "./collapsed-player";
import { MobileExpandedView } from "./mobile-expanded-view";
import { DesktopExpandedView } from "./desktop-expanded-view";
import { QueueSheet } from "./queue-sheet";

export function MiniPlayer() {
  const [showQueue, setShowQueue] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Use callbacks for state updates to prevent re-renders
  const handleSetShowQueue = useCallback((show: boolean) => {
    setShowQueue(show);
  }, []);

  const handleSetExpanded = useCallback((expand: boolean) => {
    setExpanded(expand);
  }, []);

  const handleSetCollapsed = useCallback((collapse: boolean) => {
    setCollapsed(collapse);
  }, []);

  const handleSetMobileExpanded = useCallback((expand: boolean) => {
    setIsMobileExpanded(expand);
  }, []);

  // Prevent body scroll when mobile expanded view is open
  useEffect(() => {
    if (isMobileExpanded) {
      // Store the current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
    } else {
      // Restore the scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }, [isMobileExpanded]);

  const {
    currentSong: rawCurrentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    queue: rawQueue,
    queueIndex,
    bufferedTime,
    playPause,
    seek,
    setVolume,
    nextSong,
    previousSong,
    playQueueItem,
  } = useAudioStore();

  // Type assertions to fix TypeScript errors
  const currentSong = rawCurrentSong as Song;
  const queue = rawQueue as Song[];

  // Memoize handlers to prevent unnecessary re-renders
  const handleItemClick = useCallback((index: number) => {
    playQueueItem(index);
  }, [playQueueItem]);

  const handleToggleThumbnail = useCallback(() => {
    if (window.innerWidth < 768) {
      setIsMobileExpanded(true);
    } else {
      setExpanded(true);
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      if (!currentSong) {
        toast.error("No song is playing");
      } else {
        setCollapsed((prev) => !prev);
      }
    }

    if (e.code === "Space" && !(e.target as HTMLElement)?.matches("input, textarea")) {
      e.preventDefault();
      playPause();
    }
    if (e.code === "ArrowLeft" && e.altKey) previousSong();
    if (e.code === "ArrowRight" && e.altKey) nextSong();
    if (e.code === "KeyM") setVolume(volume === 0 ? 1 : 0);
  }, [currentSong, playPause, previousSong, nextSong, setVolume, volume]);

  useEffect(() => {

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSong, playPause, previousSong, nextSong, setVolume, volume]);

  // Memoize computed values to prevent unnecessary calculations
  const canPlayNext = useMemo(() => queueIndex < queue.length - 1, [queueIndex, queue.length]);
  const canPlayPrevious = useMemo(() => queueIndex > 0 || currentTime > 3, [queueIndex, currentTime]);

  // Create a memoized QueueItem renderer to pass to QueueSheet
  const QueueItemRenderer = useCallback((props: {
    song: Song & { _id: string };
    index: number;
    currentSongId: string;
  }) => (
    <QueueItem
      {...props}
      isPlaying={isPlaying}
      onClick={handleItemClick}
    />
  ), [isPlaying, handleItemClick]);

  if (!currentSong) return <EmptyState />;

  if (collapsed) {
    return (
      <CollapsedPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        playPause={playPause}
        previousSong={previousSong}
        nextSong={nextSong}
        canPlayPrevious={canPlayPrevious}
        canPlayNext={canPlayNext}
        setShowQueue={handleSetShowQueue}
        setCollapsed={handleSetCollapsed}
        duration={duration}
        currentTime={currentTime}
        bufferedTime={bufferedTime}
        seek={seek}
      />
    );
  }

  const playerVariants = {
    mini: {
      height: "72px",
      y: 0,
    },
    expanded: {
      height: "100vh",
      y: 0,
    },
    hidden: {
      y: "100%",
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate={expanded || isMobileExpanded ? "expanded" : "mini"}
        variants={playerVariants}
        transition={{ type: "spring", damping: 20 }}
        className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-[100] will-change-transform"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)"
        }}
      >
        {/* Mini Player View */}
        <div
          className={`h-full transition-opacity ${(expanded || isMobileExpanded) ? "opacity-0 pointer-events-none" : ""}`}
        >
          <div className="container mx-auto h-full flex flex-col">
            <div className="flex-1 flex items-center justify-between gap-4 px-4">
              <div className="flex items-center flex-1 min-w-0 gap-6">
                <div className="flex items-center gap-3 cursor-pointer" onClick={handleToggleThumbnail}>
                  <img
                    src={currentSong.thumbnail}
                    alt={currentSong.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-xs md:text-base max-w-[300px] md:max-w-none">{currentSong.title}</h3>
                    <p className="font-light text-[12px] md:text-sm max-w-[300px] md:max-w-none text-muted-foreground">
                      {currentSong.uploader}
                    </p>
                  </div>
                </div>
                <div className="flex-1 min-w-0 hidden lg:block mx-4">
                  <ProgressBar mini duration={duration} currentTime={currentTime} bufferedTime={bufferedTime} seek={seek} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ControlButtons
                  mini
                  isPlaying={isPlaying}
                  playPause={playPause}
                  previousSong={previousSong}
                  nextSong={nextSong}
                  canPlayPrevious={canPlayPrevious}
                  canPlayNext={canPlayNext}
                  setExpanded={handleSetExpanded}
                  setShowQueue={handleSetShowQueue}
                  setCollapsed={handleSetCollapsed}
                  showQueue={showQueue}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleSetCollapsed(true)}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Minimize2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Expanded View */}
        <AnimatePresence mode="wait">
          {expanded && (
            <DesktopExpandedView
              currentSong={currentSong}
              volume={volume}
              setVolume={setVolume}
              setExpanded={handleSetExpanded}
              setShowQueue={handleSetShowQueue}
              setCollapsed={handleSetCollapsed}
              duration={duration}
              currentTime={currentTime}
              bufferedTime={bufferedTime}
              seek={seek}
              playPause={playPause}
              previousSong={previousSong}
              nextSong={nextSong}
              canPlayPrevious={canPlayPrevious}
              canPlayNext={canPlayNext}
              isPlaying={isPlaying}
            />
          )}
        </AnimatePresence>

        {/* Mobile Expanded View */}
        <AnimatePresence mode="popLayout">
          {isMobileExpanded && (
            <MobileExpandedView
              currentSong={currentSong}
              isPlaying={isPlaying}
              volume={volume}
              setVolume={setVolume}
              setShowQueue={handleSetShowQueue}
              setIsMobileExpanded={handleSetMobileExpanded}
              setCollapsed={handleSetCollapsed}
              headerRef={headerRef}
              duration={duration}
              currentTime={currentTime}
              bufferedTime={bufferedTime}
              seek={seek}
              playPause={playPause}
              previousSong={previousSong}
              nextSong={nextSong}
              canPlayPrevious={canPlayPrevious}
              canPlayNext={canPlayNext}
            />
          )}
        </AnimatePresence>

        {/* Queue Sheet - Only render when visible to prevent unnecessary re-renders */}
        {showQueue && (
          <QueueSheet
            open={showQueue}
            onOpenChange={handleSetShowQueue}
            queue={queue}
            currentSong={currentSong}
            QueueItem={QueueItemRenderer}
            isPlaying={isPlaying}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
