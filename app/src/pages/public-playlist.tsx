import { DesktopSongsList } from "@/components/desktop/song-list";
import { MobileSongsList } from "@/components/mobile/song-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table";
import { Navbar } from '@/features/landing/nav';
import { useUser } from "@/hooks/use-user";
import NotFoundPage from "@/layout/static/fourohfour";
import Fetcher from "@/lib/fetcher";
import { useAudioStore, usePlayerControls } from "@/stores/audioStore";
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Globe,
  Lock,
  MoreVertical,
  Music, Plus, Users
} from "lucide-react";
import { Playlist, Song } from "muse-shared";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

type PlaylistVisibility = "public" | "private" | "friends";

const api = Fetcher.getInstance();

export function PublicPlaylistView() {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: currentUser } = useUser();
  const { playSong } = usePlayerControls();
  const { currentSong, isPlaying } = useAudioStore();
  const [showAddSongDialog, setShowAddSongDialog] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

  const { data: playlist, isLoading } = useQuery<Playlist>({
    queryKey: ["playlists", idOrSlug],
    queryFn: async () => {
      if (!idOrSlug) throw new Error("Playlist ID or slug is required");
      const { data } = await api.get(`/api/playlists/${encodeURIComponent(idOrSlug)}`);
      console.log(data);
      return data;
    },
    retry: false,
  });

  const { data: userPlaylists } = useQuery<Playlist[]>({
    queryKey: ["user-playlists"],
    queryFn: async () => {
      if (!currentUser) return [];
      const { data } = await api.get("/api/playlists");
      return data;
    },
    enabled: !!currentUser,
  });

  const { data: availableSongs } = useQuery<Song[]>({
    queryKey: ["songs"],
    queryFn: async () => {
      const { data } = await api.get("/api/songs");
      return data;
    },
  });

  const addSongToUserPlaylist = useMutation({
    mutationFn: async ({ playlistId, songId }: { playlistId: string; songId: string }) => {
      await api.post(`/api/playlists/${playlistId}/songs`, { songId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-playlists"] });
      setShowAddSongDialog(false);
      toast.success("Song added to your playlist");
    },
  });

  const addSong = useMutation({
    mutationFn: async (songId: string) => {
      await api.post(`/api/playlists/${idOrSlug}/songs`, { songId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", idOrSlug] });
      setShowAddSongDialog(false);
      toast.success("Song added to playlist");
    },
  });

  const removeSong = useMutation({
    mutationFn: async (songId: string) => {
      await api.delete(`/api/playlists/${idOrSlug}/songs/${songId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", idOrSlug] });
      toast.success("Song removed from playlist");
    },
  });

  if (!playlist && !isLoading) {
    return <NotFoundPage />;
  }

  if (isLoading || !playlist || !idOrSlug) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
        <Card className="bg-black/10 backdrop-blur-md border-none shadow-sm shadow-purple-500/50 border-t-2 border-t-purple-500">
          <CardContent className="p-6">
            <div className="flex gap-6">
              <div className="relative w-48 h-48 bg-black/20 animate-pulse rounded-md" />
              <div className="flex-1 space-y-4">
                <div className="h-8 w-64 bg-black/20 animate-pulse rounded" />
                <div className="h-4 w-96 bg-black/20 animate-pulse rounded" />
                <div className="flex items-center gap-2">
                  <div className="h-4 w-20 bg-black/20 animate-pulse rounded" />
                  <div className="h-4 w-4 bg-black/20 animate-pulse rounded-full" />
                  <div className="h-4 w-32 bg-black/20 animate-pulse rounded" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 bg-black/10 backdrop-blur-md rounded-md"
            >
              <div className="w-12 h-12 bg-black/20 animate-pulse rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-black/20 animate-pulse rounded" />
                <div className="h-3 w-32 bg-black/20 animate-pulse rounded" />
              </div>
              <div className="h-4 w-16 bg-black/20 animate-pulse rounded" />
              <div className="h-8 w-8 bg-black/20 animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (playlist.visibility !== "public") {
    return <NotFoundPage />;
  }

  const isOwner = currentUser?._id === playlist.createdBy._id;

  return (
    <>
      <Navbar />
      <div className="mt-16 flex flex-col h-full">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 w-full">
        <Card className="bg-background/20 backdrop-blur-xl border border-border shadow-lg transition-all duration-300 ease-in-out hover:shadow-purple-500/10">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="relative w-full sm:w-48 h-48 shrink-0">
                <img
                  src={playlist.coverImage || "/default-cover.svg"}
                  alt={playlist.name}
                  className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-300 ease-in-out hover:scale-[1.02]"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-4 w-full">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold mb-2 line-clamp-2">{playlist.name}</h1>
                      {playlist.description && (
                        <p className="text-muted-foreground text-sm sm:text-base line-clamp-3">
                          {playlist.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        {(playlist.visibility as PlaylistVisibility) === "private" && (
                          <Lock className="w-3.5 h-3.5" />
                        )}
                        {(playlist.visibility as PlaylistVisibility) === "public" && (
                          <Globe className="w-3.5 h-3.5" />
                        )}
                        {(playlist.visibility as PlaylistVisibility) === "friends" && (
                          <Users className="w-3.5 h-3.5" />
                        )}
                        <span className="capitalize">{(playlist.visibility as PlaylistVisibility)}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <span>{playlist.songs.length} songs</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{playlist.playCount} plays</span>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-2">
                        <span>Created by</span>
                        <Link
                          to={`/dashboard/profile/${playlist.createdBy.username}`}
                          className="font-medium text-foreground hover:text-purple-500 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={playlist.createdBy.pfp} className="object-cover rounded-full" />
                              <AvatarFallback>{playlist.createdBy.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            @{playlist.createdBy.username}
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {isOwner && (
                    <div className="shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => setShowAddSongDialog(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Add Songs
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="md:hidden h-full overflow-y-auto">
            <div className="space-y-2">
              <MobileSongsList
                songs={playlist.songs}
                onPlay={playSong}
                onDelete={isOwner ? (id: string) => removeSong.mutate(id) : () => { }}
                currentSong={currentSong as Song | null}
                playlistId={playlist._id}
              />
            </div>
          </div>

          <div className="hidden md:flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="bg-secondary/5 backdrop-blur-sm sticky top-0 z-10">
                  <TableRow className="border-b-0 hover:bg-transparent">
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_tr:hover]:bg-secondary/40">
                  <DesktopSongsList
                    songs={playlist.songs}
                    onPlay={playSong}
                    onDelete={isOwner ? (id: string) => removeSong.mutate(id) : () => { }}
                    playlistId={playlist._id}
                  />
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {playlist.songs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Music className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No songs in this playlist
            </h3>
            {isOwner ? (
              <>
                <p className="text-muted-foreground mb-4">
                  Start building your playlist by adding some songs
                </p>
                <Button onClick={() => setShowAddSongDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Songs
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">
                The playlist owner hasn't added any songs yet
              </p>
            )}
          </div>
        )}

        <Dialog open={showAddSongDialog} onOpenChange={setShowAddSongDialog}>
          <DialogContent className="bg-black/90 backdrop-blur-lg border-purple-500/50 rounded-lg sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add to Your Playlist</DialogTitle>
              <DialogDescription>
                Select one of your playlists to add this song to
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto space-y-2">
              {userPlaylists?.map((userPlaylist) => (
                <div
                  key={userPlaylist._id}
                  className="flex items-center gap-4 p-2 hover:bg-black/10 rounded-md cursor-pointer"
                  onClick={() => {
                    if (selectedSongId) {
                      addSongToUserPlaylist.mutate({
                        playlistId: userPlaylist._id,
                        songId: selectedSongId,
                      });
                    }
                  }}
                >
                  <img
                    src={userPlaylist.coverImage || "/default-cover.svg"}
                    alt={userPlaylist.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{userPlaylist.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {userPlaylist.songs.length} songs
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddSongDialog(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      </div>
    </>
  );
}
