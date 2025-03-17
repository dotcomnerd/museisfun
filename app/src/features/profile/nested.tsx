import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/use-user";
import { ArrowLeft, Loader2, Music, Pencil, PlayCircle } from "lucide-react";
import { type Song } from "muse-shared";
import { useNavigate, useParams } from "react-router";

interface Playlist {
  _id: string;
  title: string;
  songs: string[];
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  name: string;
  bio: string;
  pfp: string;
  songs: Song[];
  playlists?: Playlist[];
  createdAt: string;
  updatedAt: string;
}

interface ProfileViewNestedProps {
  userData: UserProfile | undefined;
  isLoading: boolean;
  previousPath: string | undefined;
}

export function ProfileViewNested({
  userData,
  isLoading,
  previousPath,
}: ProfileViewNestedProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: currentUser } = useUser();

  const isOwnProfile = currentUser && currentUser._id === id;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold">User not found</h2>
        <p className="text-muted-foreground">
          The user you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {previousPath && (
        <Button
          variant="ghost"
          onClick={() => navigate(previousPath)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      )}
      <Card className="bg-black/10 backdrop-blur-md border-none shadow-sm shadow-purple-500/50 border-t-2 border-t-purple-500">
        <CardHeader className="flex flex-row items-center justify-between">
          {isOwnProfile && currentUser && (
            <Button
              variant="link"
              title="Edit Profile"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => navigate("/dashboard/profile")}
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={userData.pfp} alt="Profile Picture" className="object-cover" />
                <AvatarFallback>
                  {userData.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-2xl font-semibold">{userData.name}</h3>
                <p className="text-muted-foreground">@{userData.username}</p>
                <div className="text-sm text-muted-foreground mt-1">
                  <p>
                    Joined:{" "}
                    {new Date(userData.createdAt).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {userData.bio && (
              <div>
                <h4 className="text-sm font-medium mb-2">About</h4>
                <p className="text-muted-foreground">{userData.bio}</p>
              </div>
            )}

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-4">
                {userData.name}'s Songs
              </h4>
              {userData.songs.length > 0 ? (
                <div className="space-y-1">
                  {userData.songs.map((song) => (
                    <div
                      key={song._id}
                      className="group flex items-center justify-between p-2 rounded-md hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Music className="h-4 w-4 text-purple-500" />
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {song.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Added{" "}
                            {new Date(song.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          // Handle play or view song
                        }}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No songs uploaded yet.</p>
              )}
            </div>

            {userData.playlists && userData.playlists.length > 0 && (
              <>
                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-4">
                    {userData.name}'s Public Playlists
                  </h4>
                  <div className="space-y-1">
                    {userData.playlists.map((playlist) => (
                      <div
                        key={playlist._id}
                        className="group flex items-center justify-between p-2 rounded-md hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <PlayCircle className="h-4 w-4 text-purple-500" />
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {playlist.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {playlist.songs.length} songs • Created{" "}
                              {new Date(playlist.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            navigate(`/playlists/${playlist._id}`);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
