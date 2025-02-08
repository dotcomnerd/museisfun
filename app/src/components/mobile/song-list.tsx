import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Fetcher from '@/lib/fetcher';
import { Playlist, Song } from '@/lib/types';
import { cn } from "@/lib/utils";
import { useAudioStore } from "@/stores/audioStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MoreVertical, Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const api = Fetcher.getInstance();

export function MobileSongsList({
  songs,
  onPlay,
  onDelete,
  currentSong
}: {
  songs: Song[];
  onPlay: (id: string) => void;
  onDelete: (id: string) => void
  currentSong: Song | null;
}) {
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'duration'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { isPlaying, isBuffering } = useAudioStore();
  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: playlists } = useQuery<Playlist[]>({
    queryKey: ["playlists"],
    queryFn: async () => {
      const { data } = await api.get("/api/playlists");
      return data;
    },
  });

  const addSongToPlaylist = useMutation({
    mutationFn: async ({ playlistId, songId }: { playlistId: string, songId: string }) => {
      await api.post(`/api/playlists/${playlistId}/songs`, { songId });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["playlists", variables.playlistId] });
      setShowPlaylistDrawer(false);
      setSelectedSongId(null);
      toast.success("Song added to playlist");
    },
    onError: () => {
      toast.error("Failed to add song to playlist");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });

  const removeSongFromPlaylist = useMutation({
    mutationFn: async ({ playlistId, songId }: { playlistId: string, songId: string }) => {
      await api.delete(`/api/playlists/${playlistId}/songs/${songId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["playlists", variables.playlistId] });
      setShowPlaylistDrawer(false);
      setSelectedSongId(null);
      toast.success("Song removed from playlist");
    },
    onError: () => {
      toast.error("Failed to remove song from playlist");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });

  const handlePlaylistAction = (playlist: Playlist, songId: string) => {
    const songExists = playlist.songs.some(song => song._id === songId);
    if (songExists) {
      removeSongFromPlaylist.mutate({
        playlistId: playlist._id,
        songId
      });
    } else {
      addSongToPlaylist.mutate({
        playlistId: playlist._id,
        songId
      });
    }
  };

  const handleSort = (songs: Song[]) => {
    return [...songs].sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'title':
          compareValue = a.title.localeCompare(b.title);
          break;
        case 'date':
          compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'duration':
          compareValue = a.duration - b.duration;
          break;
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
  };

  const sortedSongs = handleSort(songs);

  return (
    <div className="flex flex-col">
      <div className="rounded-lg z-10 bg-primary/20 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white"
            >
              Sort By
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-black/90 backdrop-blur-sm border-none">
            <DropdownMenuItem onClick={() => setSortBy('title')} className="text-white/70">
              Title {sortBy === 'title' && '✓'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('date')} className="text-white/70">
              Date Added {sortBy === 'date' && '✓'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('duration')} className="text-white/70">
              Duration {sortBy === 'duration' && '✓'}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="text-white/70">
              {sortOrder === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Songs List */}
      <div className="flex-1">
        {sortedSongs?.map((song, index) => (
          <motion.div
            key={song._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "px-2 py-2 flex items-center gap-2 hover:bg-primary/5 transition-colors",
              index !== songs.length - 1 && "border-b border-primary/10"
            )}
            onClick={() => onPlay(song._id)}
          >
            {/* Thumbnail */}
            <div className="relative flex-shrink-0">
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-10 h-10 rounded object-cover"
              />
              {currentSong?._id === song._id && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded">
                  {isBuffering ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : isPlaying ? (
                    <Pause className="h-4 w-4 text-white" />
                  ) : (
                    <Play className="h-4 w-4 text-white" />
                  )}
                </div>
              )}
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
              <div className="text-xs truncate">
                {song.title}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="truncate">{song.uploader}</span>
                <span>•</span>
                <span>{song.duration_string}</span>
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSongId(song._id);
                  setShowPlaylistDrawer(true);
                }}>
                  <Plus className="h-3.5 w-3.5 mr-2" />
                  Add to Playlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(song._id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete Song
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        ))}
      </div>

      <Dialog open={showPlaylistDrawer} onOpenChange={setShowPlaylistDrawer}>
        <DialogContent className="bg-black/90 backdrop-blur-lg border-purple-500/50 rounded-lg sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add to Playlist</DialogTitle>
            <DialogDescription>
              Select a playlist to add this song to
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-2">
            {playlists?.map((playlist) => {
              const songExists = selectedSongId && playlist.songs.some(song => song._id === selectedSongId);
              return (
                <div
                  key={playlist._id}
                  className={cn(
                    "flex items-center gap-4 p-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors",
                    songExists && "bg-purple-500/10"
                  )}
                  onClick={() => {
                    if (selectedSongId) {
                      handlePlaylistAction(playlist, selectedSongId);
                    }
                  }}
                >
                  <img
                    src={playlist.coverImage || "/default-cover.svg"}
                    alt={playlist.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{playlist.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {playlist.songs.length} songs
                    </div>
                  </div>
                  {songExists && (
                    <div className="flex items-center gap-1 text-xs text-purple-400">
                      <span>Added</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlaylistDrawer(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};