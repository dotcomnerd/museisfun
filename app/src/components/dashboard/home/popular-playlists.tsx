import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ListMusic, Loader2, Play, PlusCircle, FolderPlus } from 'lucide-react';
import { GetMostPlayedPlaylistsResponse } from 'muse-shared';
import { Playlist, Song } from 'muse-shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { AddSongDialog } from '@/features/songs/add-song-dialog';
import { CreatePlaylistDialog } from '@/features/playlists/create-dialog';
import {
  TextureCard,
  TextureCardContent,
  TextureCardHeader,
  TextureCardTitle,
  TextureCardDescription
} from '@/components/ui/texture-card';
import { cn } from '@/lib/utils';

function CustomCreatePlaylistDialog({ children }: { children: React.ReactNode }) {
  const createPlaylistDialog = document.querySelector('[data-test-id="create-playlist-dialog"]');

  const handleClick = () => {
    // If the regular dialog exists, trigger it
    if (createPlaylistDialog) {
      const button = createPlaylistDialog.querySelector('button');
      if (button) button.click();
    }
  };

  return (
    <>
      <div onClick={handleClick} className="z-50 relative">
        {children}
      </div>
    </>
  );
}

function CustomAddSongDialog({ children }: { children: React.ReactNode }) {
  const addSongDialog = document.querySelector('[data-test-id="add-song-dialog"]');

  const handleClick = () => {
    if (addSongDialog) {
      const button = addSongDialog.querySelector('button');
      if (button) button.click();
    }
  };

  return (
    <>
      <div onClick={handleClick} className="z-50 relative">
        {children}
      </div>
    </>
  );
}

interface PopularPlaylistsProps {
  mostPlayedPlaylists: GetMostPlayedPlaylistsResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  initializeAudio: (songs: Song[], index: number, playlist: Playlist) => void | Promise<void>;
}

export function PopularPlaylists({
  mostPlayedPlaylists,
  isLoading,
  isError,
  initializeAudio
}: PopularPlaylistsProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Check if there are no playlists
  const isEmpty = !isLoading && !isError && (!mostPlayedPlaylists || mostPlayedPlaylists.length === 0);

  const mutation = useMutation({
    mutationFn: async (playlistId: string) => {
      const playlist = mostPlayedPlaylists?.find((p) => p._id === playlistId) as Playlist;
      if (!playlist) throw new Error("Playlist not found");
      await initializeAudio(playlist.songs, 0, playlist);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["most-played-playlists"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to play playlist");
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.5
      }}
      className="mb-8"
    >
      {/* Hidden original dialogs as reference points */}
      <div className="hidden" data-test-id="create-playlist-dialog">
        <CreatePlaylistDialog />
      </div>

      <div className="hidden" data-test-id="add-song-dialog">
        <AddSongDialog>
          <button>Hidden</button>
        </AddSongDialog>
      </div>

      <TextureCard
        className={cn(
          "h-full overflow-hidden relative group shadow-sm hover:shadow-lg transition-all duration-300",
          "before:absolute before:inset-0 before:z-0 before:rounded-[calc(var(--radius)-4px)] before:bg-gradient-to-br before:content-['']",
          "before:from-purple-500/10 before:to-violet-600/5 hover:before:from-purple-500/20 hover:before:to-violet-600/10"
        )}
      >
        <TextureCardHeader className={cn("relative z-10", isEmpty ? 'pb-2' : '')}>
          <TextureCardTitle className="flex items-center gap-2 text-2xl">
            <span className="bg-purple-500/10 p-1.5 rounded-lg">
              <ListMusic className="h-5 w-5 text-purple-500/90" />
            </span>
            Popular Playlists
          </TextureCardTitle>
          <TextureCardDescription>Your most played collections</TextureCardDescription>
        </TextureCardHeader>
        <TextureCardContent>
          {isError ? (
            <div className="text-red-500/80 text-center py-4">Error loading playlists</div>
          ) : isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500/60" />
            </div>
          ) : isEmpty ? (
            <motion.div
              className="flex flex-col items-center justify-center py-8 px-4 text-center relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="rounded-full bg-purple-500/10 p-4 mb-4">
                <FolderPlus className="h-10 w-10 text-purple-500/70" />
              </div>
              <h3 className="text-lg font-medium mb-1">No playlists yet</h3>
              <p className="text-muted-foreground/80 text-sm mb-6">
                Create a playlist to organize your favorite tracks
              </p>

              <div className="flex flex-col sm:flex-row gap-4 relative z-50">
                <CustomCreatePlaylistDialog>
                  <Button
                    className="gap-2 bg-purple-500/70 hover:bg-purple-600/70 text-white border-purple-400/20"
                    size="sm"
                  >
                    <FolderPlus className="h-4 w-4" />
                    Create Playlist
                  </Button>
                </CustomCreatePlaylistDialog>

                <CustomAddSongDialog>
                  <Button
                    className='gap-2 bg-purple-500/70 hover:bg-purple-600/70 text-white border-purple-400/20'
                    size='sm'
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Songs First
                  </Button>
                </CustomAddSongDialog>
              </div>

              <p className="text-muted-foreground/70 text-xs mt-6">
                Add songs to your library, then group them into playlists
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {mostPlayedPlaylists?.map((playlist: GetMostPlayedPlaylistsResponse[number], index: number) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 group p-2 rounded-lg hover:bg-accent/10 transition-colors border border-transparent hover:border-border/30"
                  whileHover={{ scale: 1.02, x: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-sm">
                    <img
                      src={playlist.coverImage ?? "/default-cover.svg"}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="link"
                      size="icon"
                      className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => mutation.mutate(playlist._id)}
                    >
                      <Play className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-foreground/90">{playlist.name}</p>
                    <p className="text-sm text-muted-foreground/70">{playlist.playCount} plays</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {isEmpty && (
            <div className="mt-6 border-t border-border/20 pt-4 relative z-10">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between hover:bg-purple-500/10"
                onClick={() => navigate("/dashboard/playlists")}
              >
                <span>Manage playlists</span>
                <ListMusic className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TextureCardContent>
      </TextureCard>
    </motion.div>
  );
}
