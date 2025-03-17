import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Song } from "muse-shared";

interface QueueItemProps {
  song: Song & { _id: string };
  index: number;
  currentSongId: string;
  isPlaying: boolean;
  onClick: (index: number) => void;
}

export const QueueItem = memo(function QueueItem({
  song,
  index,
  currentSongId,
  isPlaying,
  onClick
}: QueueItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onClick(index)}
      className={cn(
        "flex items-center justify-between py-2 px-4 rounded-lg transition-colors cursor-pointer will-change-transform",
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
              className="w-1 h-3 bg-primary rounded-full animate-sound-wave will-change-transform"
              style={{
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if something important changes
  return prevProps.song._id === nextProps.song._id &&
    prevProps.currentSongId === nextProps.currentSongId &&
    prevProps.isPlaying === nextProps.isPlaying;
});
