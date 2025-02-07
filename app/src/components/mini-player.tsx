import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Song } from "@/features/songs/dashboard/view";
import { cn, formatTime } from "@/lib/utils";
import { useAudioStore } from "@/stores/audioStore";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  ListMusic,
  Minimize2,
  MoreVertical,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { CgMiniPlayer } from "react-icons/cg";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from "sonner";
import { useIsMobile } from '@/hooks/use-mobile';

const ProgressBar = ({
    mini = false,
    collapsed = false,
    duration,
    currentTime,
    bufferedTime,
    seek
  }: {
    mini?: boolean,
    collapsed?: boolean,
    duration: number,
    currentTime: number,
    bufferedTime: number,
    seek: (position: number) => void
  }) => {
    const progressRef = useRef<HTMLDivElement>(null);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const position = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      setHoverTime(position * duration);
    };

    const handleMouseLeave = () => {
      if (!isDragging) {
        setHoverTime(null);
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const position = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      seek(position * duration);
    };

    return (
      <div className="w-full relative">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div
          ref={progressRef}
          className="w-full cursor-pointer relative group"
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
        >
          <Progress
            value={(currentTime / duration) * 100}
            max={100}
            className={cn(
              "relative transition-all duration-200",
              mini || collapsed ? "h-1.5" : "h-3"
            )}
          >
            <div
              className="absolute h-full bg-muted-foreground/30 rounded-full"
              style={{width: `${(bufferedTime / duration) * 100}%`}}
            />
            <div
              className="absolute h-full bg-primary/50 rounded-full"
              style={{width: `${(currentTime / duration) * 100}%`}}
            />
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full transition-all duration-200",
                "opacity-0 group-hover:opacity-100"
              )}
              style={{
                left: `${(currentTime / duration) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          </Progress>
        </div>
      </div>
    );
  };

export function MiniPlayer() {
  const [showQueue, setShowQueue] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const isMobile = useIsMobile();
  const headerRef = useRef<HTMLDivElement>(null);
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
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    queue,
    queueIndex,
    bufferedTime,
    playPause,
    seek,
    setVolume,
    nextSong,
    previousSong,
    playQueueItem,
  } = useAudioStore();

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * duration);
  };

  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons === 1) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      seek(percent * duration);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSong, playPause, previousSong, nextSong, setVolume, volume]);

  const canPlayNext = queueIndex < queue.length - 1;
  const canPlayPrevious = queueIndex > 0 || currentTime > 3;

  const QueueItem = useMemo(
    () =>
      ({
        song,
        index,
        currentSongId,
      }: {
        song: Song;
        index: number;
        currentSongId: string;
      }) =>
        (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => playQueueItem(index)}
            className={cn(
              "flex items-center justify-between py-2 px-4 rounded-lg transition-colors cursor-pointer",
              song._id === currentSongId && "bg-primary/10",
              song._id !== currentSongId && "hover:bg-muted"
            )}
          >
            <div className="flex items-center gap-4">
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-medium">{song.title}</h3>
                <p className="text-sm text-muted-foreground">{song.uploader}</p>
              </div>
            </div>
            {song._id === currentSongId && isPlaying && (
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-3 bg-primary rounded-full animate-sound-wave"
                    style={{
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ),
    [isPlaying, playQueueItem]
  );

  const ControlButtons = useMemo(
    () => ({ mini = false }: { mini?: boolean }) => {
      if (!mini) {
        return (
          <div className="flex items-center gap-6 justify-center">
            <Button
              size="icon"
              variant="ghost"
              onClick={previousSong}
              disabled={!canPlayPrevious}
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              size="icon"
              className="rounded-full bg-primary hover:bg-primary/90 h-10 w-10"
              onClick={playPause}
            >
              {isPlaying ? (
                <Pause className="text-primary-foreground w-5 h-5" />
              ) : (
                <Play className="text-primary-foreground ml-0.5 w-5 h-5" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={nextSong}
              disabled={!canPlayNext}
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>
        );
      }

      if (isMobile) {
        return (
          <div className="flex items-center gap-0 justify-between w-full space-x-1">
            <Button
              size="icon"
              variant="link"
              onClick={() => setExpanded(true)}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
             <Button
              size="default"
              variant="link"
              className="rounded-full bg-primary hover:bg-primary/90 h-8 w-8"
              onClick={playPause}
            >
              {isPlaying ? (
                <Pause className="text-primary-foreground w-4 h-4" />
              ) : (
                <Play className="text-primary-foreground ml-0.5 w-4 h-4" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="link">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top">
                <DropdownMenuItem
                  onClick={previousSong}
                  disabled={!canPlayPrevious}
                >
                  <SkipBack className="w-4 h-4 mr-2" />
                  Previous
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={nextSong}
                  disabled={!canPlayNext}
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Next
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setShowQueue(!showQueue)}
                >
                  <ListMusic className="w-4 h-4 mr-2" />
                  Queue
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setCollapsed(true)}
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Collapse
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={previousSong}
            disabled={!canPlayPrevious}
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            className="rounded-full bg-primary hover:bg-primary/90 h-8 w-8"
            onClick={playPause}
          >
            {isPlaying ? (
              <Pause className="text-primary-foreground w-4 h-4" />
            ) : (
              <Play className="text-primary-foreground ml-0.5 w-4 h-4" />
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={nextSong}
            disabled={!canPlayNext}
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowQueue(!showQueue)}
          >
            <ListMusic className="w-4 h-4" />
          </Button>
        </div>
      );
    },
    [
      canPlayNext,
      canPlayPrevious,
      isPlaying,
      nextSong,
      playPause,
      previousSong,
      setShowQueue,
      showQueue,
      isMobile
    ]
  );

  if (!currentSong) return <EmptyState />;

  if (collapsed) {
    return (
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: "0%" }}
        exit={{ y: "100%" }}
        className="fixed bottom-0 right-0 p-2 flex items-center gap-2 bg-background/80 backdrop-blur-lg border rounded-tl-lg shadow-lg z-50 rounded-tr-lg mr-4"
      >
        {/* Thumbnail */}
        <img
          src={currentSong.thumbnail}
          alt={currentSong.title}
          className="w-8 h-8 rounded object-cover"
        />

        {/* Previous Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={previousSong}
          disabled={!canPlayPrevious}
          className="h-8 w-8"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        {/* Play/Pause Button */}
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

        {/* Next Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={nextSong}
          disabled={!canPlayNext}
          className="h-8 w-8"
        >
          <SkipForward className="w-4 h-4" />
        </Button>

        {/* Progress Bar */}
        <div className="w-24 hidden md:block">
          <ProgressBar collapsed duration={duration} currentTime={currentTime} bufferedTime={bufferedTime} seek={seek} />
        </div>

        {/* Queue Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowQueue(true)}
          className="h-8"
        >
          <ListMusic className="w-4 h-4" />
        </Button>

        {/* Expand Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setCollapsed(false)}
          className="h-8"
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
      </motion.div>
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
      {/* Mobile Player */}
      <motion.div
        initial="hidden"
        animate={expanded || isMobileExpanded ? "expanded" : "mini"}
        variants={playerVariants}
        transition={{ type: "spring", damping: 20 }}
        className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-50"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)"
        }}
      >
        {/* Mini Player View */}
        <div
          className={cn(
            "h-full transition-opacity",
            (expanded || isMobileExpanded) && "opacity-0 pointer-events-none"
          )}
        >
          <div className="container mx-auto h-full flex flex-col">
            <div className="flex-1 flex items-center justify-between gap-4 px-4">
              <div className="flex items-center flex-1 min-w-0 gap-6">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
                  if (window.innerWidth < 768) {
                    setIsMobileExpanded(true);
                  } else {
                    setExpanded(true);
                  }
                }}>
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
                <ControlButtons mini />
              </div>

              <div className="flex items-center gap-2">
                {!isMobile && (
                  <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="md:hidden"
                    onClick={() => setShowQueue(true)}
                  >
                    <ListMusic className="w-5 h-5" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        setIsMobileExpanded(true);
                      } else {
                        setExpanded(true);
                      }
                    }}
                  >
                    <ChevronUp className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setCollapsed(true)}
                  >
                    <Minimize2 className="w-5 h-5" />
                  </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Expanded View */}

          <AnimatePresence mode="wait">
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col p-8"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setExpanded(false)}
                >
                  <ChevronDown className="w-6 h-6" />
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowQueue(true)}
                  >
                    <ListMusic className="w-6 h-6" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setCollapsed(true)}
                  >
                    <Minimize2 className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-lg mx-auto w-full">
                {/* Album Art */}
                <motion.img
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  className="w-64 h-64 rounded-2xl object-cover shadow-xl"
                />

                {/* Song Info */}
                <div className="text-center w-full">
                  <h2 className="text-xl font-semibold mb-2 whitespace-nowrap">
                    {currentSong.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {currentSong.uploader}
                  </p>
                </div>

                {/* Progress Bar */}
                <ProgressBar duration={duration} currentTime={currentTime} bufferedTime={bufferedTime} seek={seek} />

                {/* Controls */}
                <div className="space-y-6 w-full flex flex-col items-center">
                  <ControlButtons />

                  {/* Volume Controls */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setVolume(volume === 0 ? 1 : 0)}
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
                      onValueChange={(value) => setVolume(value[0] / 100)}
                      max={100}
                      step={1}
                      className="w-32"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        <AnimatePresence mode="popLayout">
          {isMobileExpanded && (
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              className="fixed inset-0 bg-background z-50 flex flex-col h-[100dvh]"
              style={{
                top: 'env(safe-area-inset-top)',
                bottom: 'env(safe-area-inset-bottom)'
              }}
            >
              <div className="sticky top-0 flex justify-between items-center p-4 bg-background/80 backdrop-blur-sm z-10 border-b" ref={headerRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileExpanded(false)}
                >
                  <ChevronDown className="w-6 h-6" />
                </Button>
                <h2 className="font-semibold">Now Playing</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowQueue(true)}
                >
                  <ListMusic className="w-6 h-6" />
                </Button>
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
                    <ProgressBar duration={duration} currentTime={currentTime} bufferedTime={bufferedTime} seek={seek} />
                  </div>

                  <div className="w-full max-w-sm space-y-8">
                    <div className="flex justify-center gap-8">
                      <ControlButtons />
                    </div>

                    <div className="flex items-center gap-6 px-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setVolume(volume === 0 ? 1 : 0)}
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
                        onValueChange={(value) => setVolume(value[0] / 100)}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Queue Sheet */}
        <Sheet open={showQueue} onOpenChange={setShowQueue}>
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
                    currentSongId={currentSong._id as string}
                  />
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </motion.div>
    </AnimatePresence>
  );
}

// Components
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed bottom-0 left-0 right-0 h-[72px] bg-background/80 backdrop-blur-lg border-t z-50"
  >
    <div className="container mx-auto h-full flex flex-col">
      <div className="flex-1 flex items-center justify-between gap-4 px-4">
        <div className="flex items-center flex-1 min-w-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
            <div className="flex-1 min-w-0">
              <div className="h-4 w-32 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="flex-1 min-w-0 hidden lg:block">
            <div className="h-1.5 w-full bg-muted animate-pulse rounded-full" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" disabled>
            <ListMusic className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" disabled>
            <ChevronUp className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" disabled>
            <Minimize2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  </motion.div>
);

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

const CollapsedPlayer = ({
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
}: CollapsedPlayerProps) => (
  <motion.div
    initial={{ y: "100%" }}
    animate={{ y: "0%" }}
    exit={{ y: "100%" }}
    className="fixed bottom-0 right-0 p-2 flex items-center gap-2 bg-background/80 backdrop-blur-lg border rounded-tl-lg shadow-lg"
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
      onClick={() => setShowQueue(true)}
      className="h-8"
    >
      <ListMusic className="w-4 h-4" />
    </Button>

    <Button
      size="sm"
      variant="ghost"
      onClick={() => setCollapsed(false)}
      className="h-8"
    >
      <ChevronUp className="w-4 h-4" />
    </Button>
  </motion.div>
);

interface MobileExpandedViewProps {
  currentSong: Song;
  isPlaying: boolean;
  volume: number;
  setVolume: (volume: number) => void;
  setShowQueue: (show: boolean) => void;
  setIsMobileExpanded: (expanded: boolean) => void;
  headerRef: React.RefObject<HTMLDivElement>;
}

const MobileExpandedView = ({
  currentSong,
  isPlaying,
  volume,
  setVolume,
  setShowQueue,
  setIsMobileExpanded,
  headerRef
}: MobileExpandedViewProps) => (
  <motion.div
    initial={{ opacity: 0, y: "100%" }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: "100%" }}
    className="fixed inset-0 bg-background z-50 flex flex-col h-[100dvh]"
    style={{
      top: 'env(safe-area-inset-top)',
      bottom: 'env(safe-area-inset-bottom)'
    }}
  >
    <div className="sticky top-0 flex justify-between items-center p-4 bg-background/80 backdrop-blur-sm z-10 border-b" ref={headerRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsMobileExpanded(false)}
      >
        <ChevronDown className="w-6 h-6" />
      </Button>
      <h2 className="font-semibold">Now Playing</h2>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowQueue(true)}
      >
        <ListMusic className="w-6 h-6" />
      </Button>
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
          <ProgressBar duration={duration} currentTime={currentTime} bufferedTime={bufferedTime} seek={seek} />
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="flex justify-center gap-8">
            <ControlButtons />
          </div>

          <div className="flex items-center gap-6 px-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setVolume(volume === 0 ? 1 : 0)}
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
              onValueChange={(value) => setVolume(value[0] / 100)}
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

interface DesktopExpandedViewProps {
  currentSong: Song;
  volume: number;
  setVolume: (volume: number) => void;
  setExpanded: (expanded: boolean) => void;
  setShowQueue: (show: boolean) => void;
  setCollapsed: (collapsed: boolean) => void;
}

const DesktopExpandedView = ({
  currentSong,
  volume,
  setVolume,
  setExpanded,
  setShowQueue,
  setCollapsed
}: DesktopExpandedViewProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 flex flex-col p-8"
  >
    <div className="flex justify-between items-center mb-8">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setExpanded(false)}
      >
        <ChevronDown className="w-6 h-6" />
      </Button>
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowQueue(true)}
        >
          <ListMusic className="w-6 h-6" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setCollapsed(true)}
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

      <ProgressBar duration={duration} currentTime={currentTime} bufferedTime={bufferedTime} seek={seek} />

      <div className="space-y-6 w-full flex flex-col items-center">
        <ControlButtons />

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setVolume(volume === 0 ? 1 : 0)}
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
            onValueChange={(value) => setVolume(value[0] / 100)}
            max={100}
            step={1}
            className="w-32"
          />
        </div>
      </div>
    </div>
  </motion.div>
);

interface QueueSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queue: Song[];
  currentSong: Song;
  QueueItem: React.ComponentType<{
    song: Song & { _id: string };
    index: number;
    currentSongId: string;
  }>;
}

const QueueSheet = ({ open, onOpenChange, queue, currentSong, QueueItem }: QueueSheetProps) => (
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
              currentSongId={currentSong._id as string}
            />
          ))}
        </div>
      </ScrollArea>
    </SheetContent>
  </Sheet>
);
