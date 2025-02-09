import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Fetcher from '@/lib/fetcher';
import { Playlist, Song } from '@/lib/types';
import { cn } from "@/lib/utils";
import { useAudioStore } from "@/stores/audioStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Filter, Heart, MoreVertical, Pause, Pencil, Play, Plus, Search, Share2, Trash2 } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
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

  const handleShare = async (song: Song) => {
    try {
      await navigator.share({
        title: song.title,
        text: `Check out ${song.title} by ${song.uploader} on Muse`,
        url: window.location.href
      });
    } catch (err) {
      toast.error("Failed to share song");
    }
  };

  const toggleFavorite = (songId: string) => {
    setFavorites(prev =>
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
    toast.success("Updated favorites");
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.uploader.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedSongs = handleSort(filteredSongs);

  return (
    <div className="flex flex-col">
      <div className="space-y-2 p-3 bg-background/40 backdrop-blur-sm rounded-xl">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-background/60"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(true)}
            className="shrink-0"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Songs List */}
      <ScrollArea className="flex-1">
        {sortedSongs?.map((song, index) => (
          <motion.div
            key={song._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "px-2 py-2 flex items-center gap-2 active:bg-primary/10 transition-colors",
              index !== songs.length - 1 && "border-b border-primary/10"
            )}
            onClick={() => onPlay(song._id)}
          >
            {/* Thumbnail */}
            <div className="relative flex-shrink-0">
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              {currentSong?._id === song._id && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
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
              <div className="text-sm font-medium truncate">
                {song.title}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="truncate">{song.uploader}</span>
                <span>•</span>
                <span>{song.duration_string}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(song._id);
              }}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  favorites.includes(song._id) ? "fill-red-500 text-red-500" : "text-muted-foreground"
                )}
              />
            </Button>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
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
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleShare(song);
                }}>
                  <Share2 className="h-3.5 w-3.5 mr-2" />
                  Share Song
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
      </ScrollArea>

      {/* Filter Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="bottom" className="h-[50vh]">
          <SheetHeader>
            <SheetTitle>Sort & Filter</SheetTitle>
            <SheetDescription>
              Customize how your songs are displayed
            </SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <div className="font-medium text-sm">Sort By</div>
              <div className="grid grid-cols-3 gap-2">
                {['title', 'date', 'duration'].map((option) => (
                  <Button
                    key={option}
                    variant={sortBy === option ? "default" : "outline"}
                    onClick={() => setSortBy(option as typeof sortBy)}
                    className="w-full capitalize"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-sm">Order</div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={sortOrder === 'asc' ? "default" : "outline"}
                  onClick={() => setSortOrder('asc')}
                  className="w-full"
                >
                  Ascending
                </Button>
                <Button
                  variant={sortOrder === 'desc' ? "default" : "outline"}
                  onClick={() => setSortOrder('desc')}
                  className="w-full"
                >
                  Descending
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Playlist Dialog */}
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
                    "flex items-center gap-4 p-2 active:bg-white/10 rounded-md transition-colors",
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
                        className="h-6 w-6"
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