import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser } from "@/hooks/use-user";
import Fetcher from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import { useAudioStore } from "@/stores/audioStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Pencil, Plus, Trash2 } from "lucide-react";
import { Playlist, Song } from 'muse-shared';
import React, { useCallback, useState } from "react";
import { toast } from 'sonner';

const api = Fetcher.getInstance();

export function DesktopSongsList({ songs, onPlay, onDelete, playlistId }: {
  songs: Song[];
  onPlay: (id: string, playlistId?: string) => void;
  onDelete: (id: string) => void;
  playlistId?: string;
}) {
  const queryClient = useQueryClient();
  const { currentSong, isPlaying, isBuffering } = useAudioStore();
  const [editingField, setEditingField] = useState<{ id: string, field: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const { data: currentUser } = useUser();

  const canEditSong = (song: Song) => {
    return currentUser?._id === song.createdBy;
  };

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

  const editMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string, field: string, value: string }) => {
      if (isEditing) return null;
      setIsEditing(true);
      try {
        const response = await api.patch(`/api/songs/${id}`, {
          [field]: value,
        });
        if (response.status !== 200) {
          throw new Error('Failed to update song');
        }
        return response.data;
      } finally {
        setIsEditing(false);
      }
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['songs'] });
        setEditingField(null);
        toast.success('Song updated successfully');
      }
    },
    onError: () => {
      toast.error('Failed to update song. Please try again later');
    }
  });

  const handleAddToPlaylist = (song: Song) => {
    if (!currentUser) {
      toast.error("You must be logged in to add a song to a playlist");
      return;
    }
    setSelectedSongId(song._id);
    setShowPlaylistDrawer(true);
  };

  type FavoriteState = "added" | "removed" | "failed";

  const favoriteMutation = useMutation<FavoriteState, Error, string>({
    mutationFn: async (songId: string) => {
      const response = await api.post('/users/media/favorite/song', {
        itemId: songId
      });
      return response.data.favoriteState as FavoriteState;
    },
    onSuccess: (state: FavoriteState) => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      if (state === "added") {
        toast.success('Song added to favorites');
      } else if (state === "removed") {
        toast.success('Song removed from favorites');
      } else {
        toast.error('Failed to favorite song');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to favorite song');
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    }
  });

  const handleSubmit = useCallback((song: Song, field: string, value: string) => {
    if (value !== song[field as keyof Song] && !isEditing) {
      editMutation.mutate({
        id: song._id,
        field,
        value
      });
    }
    setEditingField(null);
  }, [editMutation, isEditing]);

  const handleFavorite = useCallback((songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    favoriteMutation.mutate(songId);
  }, [favoriteMutation]);

  const handleDelete = useCallback((songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const song = songs.find(s => s._id === songId);
    if (song && canEditSong(song)) {
      onDelete(songId);
    }
  }, [onDelete, songs, canEditSong]);

  const handleEditClick = useCallback((songId: string, field: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const song = songs.find(s => s._id === songId);
    if (song && canEditSong(song)) {
      setEditingField({ id: songId, field });
    }
  }, [songs, canEditSong]);

  const isMobile = useIsMobile();

  return (
    <>
      {songs.map((song) => (
        <TableRow
          key={song._id}
          className={cn(
            "border-b-0 h-10 cursor-pointer group transition-none",
            { "bg-secondary/30": song._id === currentSong?._id }
          )}
          onClick={() => onPlay(song._id, playlistId)}
        >
          <TableCell className="py-1">
            <div className="flex items-center gap-2">
              <div className="relative">
                <img
                  src={song.thumbnail}
                  alt={`${song.title} thumbnail`}
                  className="rounded-sm object-cover size-8"
                />
                <AnimatePresence mode="wait">
                  {song._id === currentSong?._id && (
                    <motion.div
                      className="absolute inset-0 bg-black/80 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.05
                      }}
                    >
                      <div className="flex items-center justify-center gap-[2px] w-full">
                        {[0, 1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            className="w-[2px] bg-purple-500 rounded-full"
                            animate={{
                              height: isBuffering
                                ? ["10px", "16px", "10px"]
                                : isPlaying
                                  ? ["14px", "8px", "14px"]
                                  : "10px",
                              opacity: isPlaying ? 1 : 0.5
                            }}
                            transition={{
                              duration: 0.4,
                              repeat: Infinity,
                              repeatType: "reverse",
                              delay: i * 0.1,
                              ease: "linear"
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "w-full max-w-[550px] lg:max-w-[800px] px-1 group-hover:relative rounded",
                    editingField?.id === song._id && editingField?.field === 'title' && "ring-1 ring-primary"
                  )}
                >
                  {editingField?.id === song._id && editingField?.field === 'title' ? (
                    <input
                      type="text"
                      defaultValue={song.title}
                      className="w-full bg-transparent border-none focus:outline-none"
                      onBlur={(e) => handleSubmit(song, 'title', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmit(song, 'title', e.currentTarget.value);
                          e.currentTarget.blur();
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{song.title}</span>
                        {canEditSong(song) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity p-1 translate-y-[-1px]"
                            onClick={(e) => handleEditClick(song._id, 'title', e)}
                          >
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TableCell>
          <TableCell className="text-muted-foreground text-xs py-1">
            {song.duration_string}
          </TableCell>
          <TableCell className="text-muted-foreground text-xs py-1">
            {song.uploader}
          </TableCell>
          <TableCell className="text-muted-foreground text-xs py-1">
            {new Date(parseInt(song.upload_date) * 1000).toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric'
            })}
          </TableCell>
          <TableCell className="text-right py-1">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
              <Tooltip delayDuration={500} disableHoverableContent={isMobile}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:text-primary"
                    onClick={(e) => handleFavorite(song._id, e)}
                  >
                    {song.isFavorited ? (
                      <Heart className="h-3.5 w-3.5 fill-red-500 stroke-red-500" />
                    ) : (
                      <Heart className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {song.isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                </TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={500} disableHoverableContent={isMobile}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToPlaylist(song);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Add to Playlist
                </TooltipContent>
              </Tooltip>
              {canEditSong(song) && (
                <Tooltip delayDuration={500} disableHoverableContent={isMobile}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:text-destructive"
                      onClick={(e) => handleDelete(song._id, e)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Delete Song
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TableCell>
        </TableRow>
      ))}

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
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedSongId) {
                            removeSongFromPlaylist.mutate({
                              playlistId: playlist._id,
                              songId: selectedSongId
                            });
                          }
                        }}
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
    </>
  );
}
