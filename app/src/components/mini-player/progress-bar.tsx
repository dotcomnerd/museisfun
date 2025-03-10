import React, { useRef, useState, memo, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { cn, formatTime } from "@/lib/utils";

interface ProgressBarProps {
  mini?: boolean;
  collapsed?: boolean;
  duration: number;
  currentTime: number;
  bufferedTime: number;
  seek: (position: number) => void;
}

export const ProgressBar = memo(function ProgressBar({
  mini = false,
  collapsed = false,
  duration,
  currentTime,
  bufferedTime,
  seek
}: ProgressBarProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const position = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    setHoverPosition(position);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!isDragging) {
      setHoverPosition(null);
    }
  }, [isDragging]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const position = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    seek(position * duration);
  }, [duration, seek]);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Calculate these values once to avoid repeated calculations in render
  const currentTimePercent = (currentTime / duration) * 100;
  const bufferedTimePercent = (bufferedTime / duration) * 100;
  const thumbPosition = `${currentTimePercent}%`;

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
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <Progress
          value={currentTimePercent}
          max={100}
          className={cn(
            "relative will-change-transform",
            mini || collapsed ? "h-1.5" : "h-3"
          )}
        >
          <div
            className="absolute h-full bg-muted-foreground/30 rounded-full will-change-transform"
            style={{ width: `${bufferedTimePercent}%` }}
          />
          <div
            className="absolute h-full bg-primary/50 rounded-full will-change-transform"
            style={{ width: `${currentTimePercent}%` }}
          />
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full will-change-transform",
              "opacity-0 group-hover:opacity-100"
            )}
            style={{
              left: thumbPosition,
              transform: 'translate(-50%, -50%)'
            }}
          />
          {hoverPosition !== null && (
            <div
              className="absolute bottom-full mb-1 px-1.5 py-0.5 bg-background border rounded text-xs transform -translate-x-1/2 will-change-transform"
              style={{ left: `${hoverPosition * 100}%` }}
            >
              {formatTime(hoverPosition * duration)}
            </div>
          )}
        </Progress>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if important values have changed
  return (
    prevProps.mini === nextProps.mini &&
    prevProps.collapsed === nextProps.collapsed &&
    Math.floor(prevProps.currentTime) === Math.floor(nextProps.currentTime) &&
    Math.floor(prevProps.bufferedTime) === Math.floor(nextProps.bufferedTime) &&
    prevProps.duration === nextProps.duration
  );
});
