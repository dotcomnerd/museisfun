import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListMusic, Loader2, Play, PlusCircle, FolderPlus } from 'lucide-react';
import { GetMostPlayedPlaylistsResponse } from 'muse-shared';
import { Playlist } from '@/lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { AddSongDialog } from '@/features/songs/add-song-dialog';
import { CreatePlaylistDialog } from '@/features/playlists/create-dialog';

interface PopularPlaylistsProps {
  mostPlayedPlaylists: GetMostPlayedPlaylistsResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  initializeAudio: (songs: any[], index: number, playlist: Playlist) => void | Promise<void>;
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
      <Card className="bg-gradient-to-br from-background/30 to-background/10 hover:shadow-xl transition-all duration-500 border-border/30 backdrop-blur-sm overflow-hidden relative">
        <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-primary/5 blur-xl"></div>
        <div className="absolute -left-20 -bottom-20 w-60 h-60 rounded-full bg-primary/10 blur-xl opacity-30"></div>
        <CardHeader className={`${isEmpty ? 'pb-2' : ''}`}>
          <CardTitle className="text-2xl flex items-center gap-2">
            <span className="bg-primary/10 p-1.5 rounded-lg">
              <ListMusic className="h-5 w-5 text-primary" />
            </span>
            Popular Playlists
          </CardTitle>
          <CardDescription>Your most played collections</CardDescription>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className="text-red-500 text-center py-4">Error loading playlists</div>
          ) : isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : isEmpty ? (
            <motion.div
              className="flex flex-col items-center justify-center py-8 px-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <FolderPlus className="h-10 w-10 text-primary/70" />
              </div>
              <h3 className="text-lg font-medium mb-1">No playlists yet</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Create a playlist to organize your favorite tracks
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <div onClick={(e) => e.stopPropagation()}>
                  <CreatePlaylistDialog />
                </div>

                <AddSongDialog>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Songs First
                  </Button>
                </AddSongDialog>
              </div>

              <p className="text-muted-foreground text-xs mt-6">
                Add songs to your library, then group them into playlists
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mostPlayedPlaylists?.map((playlist: GetMostPlayedPlaylistsResponse[number], index: number) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 group p-2 rounded-lg hover:bg-accent/20 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <img
                      src={playlist.coverImage ?? "/default-cover.svg"}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="link"
                      size="icon"
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => mutation.mutate(playlist._id)}
                    >
                      <Play className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{playlist.name}</p>
                    <p className="text-sm text-muted-foreground">{playlist.playCount} plays</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {isEmpty && (
            <div className="mt-6 border-t border-border/30 pt-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between hover:bg-background/60"
                onClick={() => navigate("/dashboard/playlists")}
              >
                <span>Manage playlists</span>
                <ListMusic className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
