import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Fetcher from "@/lib/fetcher";
import { usePlayerControls } from "@/stores/audioStore";
import { useQuery } from "@tanstack/react-query";
import { Globe, Loader2, Lock, Play, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { CreatePlaylistDialog } from "./create-dialog";
import { Playlist } from "./nested";

const api = Fetcher.getInstance();

export function PlaylistView() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { playSong } = usePlayerControls();

  const { data: playlists, isLoading } = useQuery<Playlist[]>({
    queryKey: ["playlists"],
    queryFn: async () => {
      const { data } = await api.get<Playlist[]>("/api/playlists");
      return data;
    },
  });

  const filteredPlaylists = playlists?.filter(
    (playlist) =>
      playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playlist.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 gap-4">
            <Input
                placeholder="Search playlists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:max-w-sm backdrop-blur-lg focus:ring-2 focus:ring-purple-500/50 transition-all duration-200"
            />
            <CreatePlaylistDialog />
        </div>

        <div className="flex flex-wrap gap-4">
            {isLoading ? (
                <div className="col-span-full flex justify-center items-center min-h-[200px]">
                    <Loader2 className="animate-spin text-purple-500 w-8 h-8" />
                </div>
            ) : filteredPlaylists?.length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground py-12">
                    <p>No playlists found</p>
                </div>
            ) : (
                filteredPlaylists?.map((playlist) => (
                    <Card
                        key={playlist._id}
                        className="group bg-black/20 backdrop-blur-lg border-purple-500/10 hover:border-purple-500/30 shadow-sm hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer min-w-[200px] max-w-[290px]"
                        onClick={() => navigate(`/dashboard/playlists/${playlist._id}`)}
                    >
                        <CardContent className="p-4 md:p-6">
                            <div className="aspect-square mb-4 relative overflow-hidden rounded-lg">
                                <img
                                    src={playlist.coverImage || "/default-cover.svg"}
                                    alt={playlist.name}
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-in-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="absolute bottom-4 right-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 hover:bg-purple-500 hover:text-white"
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (playlist.songs.length > 0) {
                                                await playSong(playlist.songs[0]._id, playlist._id);
                                            }
                                        }}
                                    >
                                        <Play className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold truncate text-lg">{playlist.name}</h3>
                                <p className="text-sm text-muted-foreground/80 truncate">
                                    {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
                                </p>
                                <div className="flex items-center text-sm text-muted-foreground/80 gap-1">
                                    {playlist.visibility === "private" && (
                                        <Lock className="h-3.5 w-3.5" />
                                    )}
                                    {playlist.visibility === "public" && (
                                        <Globe className="h-3.5 w-3.5" />
                                    )}
                                    {playlist.visibility === "friends" && (
                                        <Users className="h-3.5 w-3.5" />
                                    )}
                                    <span className="capitalize">{playlist.visibility}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    </div>
  );
}
