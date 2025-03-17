import { memo } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    ChevronDown,
    ChevronUp,
    ListMusic,
    MoreVertical,
    Pause,
    Play,
    SkipBack,
    SkipForward,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ControlButtonsProps {
  mini?: boolean;
  isPlaying: boolean;
  playPause: () => void;
  previousSong: () => void;
  nextSong: () => void;
  canPlayPrevious: boolean;
  canPlayNext: boolean;
  setExpanded?: (expanded: boolean) => void;
  setShowQueue?: (show: boolean) => void;
  setCollapsed?: (collapsed: boolean) => void;
  showQueue?: boolean;
}

export const ControlButtons = memo(function ControlButtons({
  mini = false,
  isPlaying,
  playPause,
  previousSong,
  nextSong,
  canPlayPrevious,
  canPlayNext,
  setExpanded,
  setShowQueue,
  setCollapsed,
  showQueue
}: ControlButtonsProps) {
  const isMobile = useIsMobile();

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
          onClick={() => setExpanded?.(true)}
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
              onClick={() => setShowQueue?.(!showQueue)}
            >
              <ListMusic className="w-4 h-4 mr-2" />
              Queue
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setCollapsed?.(true)}
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
        onClick={() => setShowQueue?.(!showQueue)}
      >
        <ListMusic className="w-4 h-4" />
      </Button>
    </div>
  );
});
