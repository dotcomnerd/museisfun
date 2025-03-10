import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Heart, Loader2, Play, ChevronRight, PlusCircle } from 'lucide-react';
import { Song, Playlist } from '@/lib/types';
import { useQueryClient } from '@tanstack/react-query';
import Fetcher from '@/lib/fetcher';
import { toast } from 'sonner';
import { AddSongDialog } from '@/features/songs/add-song-dialog';
import {
  TextureCard,
  TextureCardContent,
  TextureCardHeader,
  TextureCardTitle,
  TextureCardDescription
} from '@/components/ui/texture-card';
import { cn } from '@/lib/utils';

// Custom wrapper that ensures dialog works
function CustomAddSongDialog({ children }: { children: React.ReactNode }) {
  // We don't actually need the isOpen state, just need to keep
  // consistent DOM structure for querying
  const addSongDialog = document.querySelector('[data-test-id="add-song-dialog"]');

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If the regular dialog exists, trigger it
    if (addSongDialog) {
      const button = addSongDialog.querySelector('button');
      if (button) button.click();
    }
  };

  return (
    <div onClick={handleClick} className="z-50 relative">
      {children}
    </div>
  );
}

interface FavoriteTracksProps {
  favoriteTracks: Song[] | undefined;
  isLoading: boolean;
  isError: boolean;
  initializeAudio: (songs: Song[], index: number, playlist?: Playlist) => void | Promise<void>;
  playSong: (songId: string) => void;
}

export function FavoriteTracks({
  favoriteTracks,
  isLoading,
  isError,
  initializeAudio,
  playSong
}: FavoriteTracksProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Check if there are no favorites
  const isEmpty = !isLoading && !isError && (!favoriteTracks || favoriteTracks.length === 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.4
      }}
    >
      {/* Hidden reference dialog */}
      <div className="hidden" data-test-id="add-song-dialog">
        <AddSongDialog>
          <button>Hidden</button>
        </AddSongDialog>
      </div>

      <TextureCard
        className={cn(
          "h-full overflow-hidden relative group shadow-sm hover:shadow-lg transition-all duration-300",
          "before:absolute before:inset-0 before:z-0 before:rounded-[calc(var(--radius)-4px)] before:bg-gradient-to-br before:content-['']",
          "before:from-red-500/10 before:to-rose-600/5 hover:before:from-red-500/20 hover:before:to-rose-600/10"
        )}
      >
        <TextureCardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <div className="space-y-1">
            <TextureCardTitle className="flex items-center gap-2 text-2xl">
              <span className="bg-red-500/10 p-1.5 rounded-lg">
                <Heart className="h-5 w-5 fill-red-500/80 text-red-500/80" />
              </span>
              Favorites
            </TextureCardTitle>
            <TextureCardDescription>Your most loved tracks</TextureCardDescription>
          </div>
          {!isEmpty && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard/favorites")}
              className="gap-1 group/btn border-red-500/20 hover:bg-red-500/10"
            >
              <span>View All</span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 1.5,
                  repeatDelay: 2
                }}
              >
                <ChevronRight className="h-3 w-3" />
              </motion.span>
            </Button>
          )}
        </TextureCardHeader>
        <TextureCardContent className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
          {isError ? (
            <div className="text-red-500/80 text-center py-4">Error loading favorite tracks</div>
          ) : isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-red-500/60" />
            </div>
          ) : isEmpty ? (
            <motion.div
              className="flex flex-col items-center justify-center py-8 px-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="rounded-full bg-red-500/10 p-4 mb-4">
                <Heart className="h-10 w-10 text-red-500/70" />
              </div>
              <h3 className="text-lg font-medium mb-1">No favorites yet</h3>
              <p className="text-muted-foreground/80 text-sm mb-6">
                Heart your favorite songs to find them here
              </p>

              <CustomAddSongDialog>
                <Button
                  className="gap-2 bg-red-500/70 hover:bg-red-600/70 text-white border-red-400/20 relative -z-10"
                  size="sm"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Songs to Favorite
                </Button>
              </CustomAddSongDialog>

              <div className="flex items-center justify-center gap-2 mt-6 text-muted-foreground/70 text-xs">
                <Heart className="h-3 w-3 fill-red-500/80 text-red-500/80" />
                <span>Click the heart icon on any song to add it to favorites</span>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3 relative z-10">
              {favoriteTracks?.map((track, index) => (
                <motion.div
                  key={index}
                  className="group relative flex items-center gap-4 p-3 rounded-xl hover:bg-accent/10 transition-all duration-300 cursor-pointer border border-transparent hover:border-border/30"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05
                  }}
                  whileHover={{ x: 5, backgroundColor: "rgba(var(--accent)/0.1)" }}
                  onClick={() => {
                    const cachedSongs = queryClient.getQueryData<Song[]>(["favorite-tracks"]);
                    if (cachedSongs) {
                      const song = cachedSongs[index];
                      initializeAudio([song], index);
                      playSong(song._id);
                    }
                  }}
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="bg-white/80 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Play className="h-4 w-4 text-red-500/90 fill-red-500/80" />
                      </motion.div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-foreground/90">{track.title}</p>
                    <p className="text-sm text-muted-foreground/70 truncate">{track.uploader}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hover:bg-red-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      const songId = track._id;
                      const api = Fetcher.getInstance();
                      api.post('/users/media/favorite/song', {
                        itemId: songId
                      }).then(() => {
                        queryClient.invalidateQueries({ queryKey: ["favorite-tracks"] });
                        toast.success("Removed from favorites");
                      }).catch(() => {
                        toast.error("Failed to remove from favorites");
                      });
                    }}
                  >
                    <Heart className="h-5 w-5 fill-red-500/80 text-red-500/80" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </TextureCardContent>
        <div className="px-6 py-3 mt-2 border-t border-border/20 bg-background/20 backdrop-blur-sm relative z-10">
          {isEmpty ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between hover:bg-red-500/10"
              onClick={() => navigate("/dashboard/downloads")}
            >
              <span>Browse your library</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between hover:bg-red-500/10"
              onClick={() => navigate("/dashboard/favorites")}
            >
              <span>Manage favorites</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TextureCard>
    </motion.div>
  );
}
