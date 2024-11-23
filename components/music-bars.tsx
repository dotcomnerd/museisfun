import { useTrackContext } from "@/context/track-context";
import { cn } from "@/lib/utils";

export function MusicBars() {
  const { isPlaying } = useTrackContext()!;

  return (
    <div className="flex space-x-1">
      <div
        className={cn("w-0.5 h-full bg-green-500", {
          "animate-music-bar": isPlaying,
        })}
      ></div>
      <div
        className={cn("w-0.5 h-2/3 bg-green-500", {
          "animate-music-bar animation-delay-200": isPlaying,
        })}
      ></div>
      <div
        className={cn("w-0.5 h-1/3 bg-green-500", {
          "animate-music-bar animation-delay-400": isPlaying,
        })}
      ></div>
    </div>
  );
}
