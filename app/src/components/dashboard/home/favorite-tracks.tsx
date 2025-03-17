import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Heart, Loader2, Play, ChevronRight, PlusCircle, Search, Plus } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

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

function FavoriteSongPicker({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const api = Fetcher.getInstance();
  // Get all songs from cache
  const allSongs = queryClient.getQueryData<Song[]>(['songs']) || [];
  const hasSongs = allSongs.length > 0;
  if (!hasSongs) {
    return (
      <CustomAddSongDialog>
        {children}
      </CustomAddSongDialog>
    );
  }

  const filteredSongs = searchQuery
    ? allSongs.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.uploader.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allSongs;

  const handleFavoriteSong = async (songId: string) => {
    try {
      await api.post('/users/media/favorite/song', { itemId: songId });
      queryClient.invalidateQueries({ queryKey: ["favorite-tracks"] });
      toast.success("Added to favorites");
      setOpen(false);
    } catch {
      toast.error("Failed to add to favorites");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Favorites</DialogTitle>
          <DialogDescription>
            Select songs from your library to add to favorites
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search songs..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="mt-4 max-h-[60vh] pr-3">
          <div className="space-y-2">
            {filteredSongs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No songs found" : "No songs in your library"}
              </div>
            ) : (
              filteredSongs.map((song) => (
                <div
                  key={song._id}
                  className="flex items-center gap-3 p-2 hover:bg-accent/20 rounded-md cursor-pointer group transition-colors"
                  onClick={() => handleFavoriteSong(song._id)}
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{song.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{song.uploader}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
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
  const allSongs = queryClient.getQueryData<Song[]>(['songs']) || [];
  const hasSongs = allSongs.length > 0;
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
      className="h-full flex flex-col"
    >
      {/* Hidden reference dialog */}
      <div className="hidden" data-test-id="add-song-dialog">
        <AddSongDialog>
          <button>Hidden</button>
        </AddSongDialog>
      </div>

      <TextureCard
        className={cn(
          "h-full overflow-hidden relative group shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col",
          "before:absolute before:inset-0 before:z-0 before:rounded-[calc(var(--radius)-4px)] before:bg-gradient-to-br before:content-['']",
          "before:from-red-500/10 before:to-rose-600/5 hover:before:from-red-500/20 hover:before:to-rose-600/10"
        )}
      >
        <TextureCardHeader className="flex flex-row items-center justify-between pb-2 relative z-10 mx-4">
          <div className="space-y-1">
            <TextureCardTitle className="flex items-center gap-2 text-2xl">
              <span className="bg-red-500/10 p-1.5 rounded-lg">
                <Heart className="h-5 w-5 fill-red-500/80 text-red-500/80" />
              </span>
              Favorites
            </TextureCardTitle>
            <TextureCardDescription>Your most loved tracks</TextureCardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!isEmpty && (
              <Button
                onClick={() => navigate("/dashboard/favorites")}
className="gap-2 bg-red-500/70 hover:bg-red-600/70 text-white border-red-400/20 relative z-10"
                      size="sm"
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

            {/* Add More button - always visible */}
            {hasSongs && (
              <FavoriteSongPicker>
                <Button
                  className="gap-2 bg-red-500/70 hover:bg-red-600/70 text-white border-red-400/20 relative z-10"
                  size="sm"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add More</span>
                </Button>
              </FavoriteSongPicker>
            )}
          </div>
        </TextureCardHeader>
        <TextureCardContent className="h-[360px] overflow-hidden flex-1 pr-2 relative z-10">
          <ScrollArea className="h-full custom-scrollbar">
            {isError ? (
              <div className="text-red-500/80 text-center py-4">Error loading favorite tracks</div>
            ) : isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-red-500/60" />
              </div>
            ) : isEmpty ? (
              <motion.div
                className="flex flex-col items-center justify-center h-full py-8 px-4 text-center"
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

                {/* Use custom picker if we have songs, otherwise use the add song dialog */}
                {hasSongs ? (
                  <FavoriteSongPicker>
                    <Button
                      className="gap-2 bg-red-500/70 hover:bg-red-600/70 text-white border-red-400/20 relative z-10"
                      size="sm"
                    >
                      <Heart className="h-4 w-4" />
                      Add Songs to Favorite
                    </Button>
                  </FavoriteSongPicker>
                ) : (
                  <CustomAddSongDialog>
                    <Button
                      className="gap-2 bg-red-500/70 hover:bg-red-600/70 text-white border-red-400/20 relative z-10"
                      size="sm"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add Songs to Favorite
                    </Button>
                  </CustomAddSongDialog>
                )}

                <div className="flex items-center justify-center gap-2 mt-6 text-muted-foreground/70 text-xs">
                  <Heart className="h-3 w-3 fill-red-500/80 text-red-500/80" />
                  <span>Click the heart icon on any song to add it to favorites</span>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3 relative">
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
          </ScrollArea>
        </TextureCardContent>
        <div className="px-6 py-3 mt-auto border-t border-border/20 bg-background/20 backdrop-blur-sm relative z-10">
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
