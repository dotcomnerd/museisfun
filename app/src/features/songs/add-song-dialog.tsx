/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Fetcher from "@/lib/fetcher";
import { extractYouTubeId, fetchYouTubeMetadata } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Music, YoutubeIcon, CloudIcon, Users, Play, Pause } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import MusicPlayer, { VideoMetadata } from './preview-player';
import { addSongSchema, AddSongInput } from '@/lib/types';
import { addSong } from '@/api/requests';

const api = Fetcher.getInstance();

export function AddSongDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [urlType, setUrlType] = useState<'youtube' | 'soundcloud' | 'other' | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata>({});
  const [volume,] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();
  const prevUrlRef = useRef<string>("");
  const playerRef = useRef<YT.Player | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AddSongInput>({
    resolver: zodResolver(addSongSchema),
  });

  const urlValue = useWatch({
    control,
    name: "url",
    defaultValue: "",
  });

  // For faster visual feedback, load basic metadata immediately when URL changes
  useEffect(() => {
    if (!urlValue) {
      setUrlType(null);
      setVideoMetadata({});
      setIsPlaying(false);
      return;
    }

    // If URL changes, stop playback
    if (prevUrlRef.current !== urlValue) {
      setIsPlaying(false);

      // When URL changes, we need to load the new video
      if (playerRef.current && urlValue.includes('youtube')) {
        const videoId = extractYouTubeId(urlValue);
        if (videoId) {
          playerRef.current.loadVideoById(videoId);
          playerRef.current.pauseVideo();
        }
      }
    }

    prevUrlRef.current = urlValue;

    const fetchPreview = async () => {
      if (urlValue.includes('youtube.com') || urlValue.includes('youtu.be')) {
        const videoId = extractYouTubeId(urlValue);
        if (videoId) {
          try {
            const metadata = await fetchYouTubeMetadata(videoId);
            setVideoMetadata(metadata);
            setUrlType('youtube');
          } catch (err) {
            console.error("Error fetching initial metadata:", err);
          }
        }
      } else if (urlValue.includes('soundcloud.com')) {
        setUrlType('soundcloud');
      } else if (urlValue.match(/\.(mp3|wav|ogg|flac)$/i)) {
        setUrlType('other');
      } else {
        setUrlType('other');
      }
    };

    fetchPreview();
  }, [urlValue]);

  // Initialize YouTube player when needed
  useEffect(() => {
    const initializePlayer = () => {
      // Check if we already have a player instance
      if (!playerRef.current && urlValue && urlValue.includes('youtube')) {
        const videoId = extractYouTubeId(urlValue);
        if (videoId && window.YT && window.YT.Player) {
          // Create a hidden player element if it doesn't exist
          let playerElement = document.getElementById('youtube-hidden-player');
          if (!playerElement) {
            playerElement = document.createElement('div');
            playerElement.id = 'youtube-hidden-player';
            playerElement.style.display = 'none';
            document.body.appendChild(playerElement);
          }

          // Initialize the player
          playerRef.current = new window.YT.Player('youtube-hidden-player', {
            height: '0',
            width: '0',
            videoId: videoId,
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              playsinline: 1,
            },
            events: {
              onReady: (event: YT.Event) => {
                event.target.setVolume(volume);
              },
              onStateChange: (event: YT.Event) => {
                if (event.data === window.YT.PlayerState.ENDED) {
                  setIsPlaying(false);
                }
              },
              onError: (event: YT.Event) => {
                console.error("YouTube player error:", event.data);
                setIsPlaying(false);
              }
            }
          });
        }
      }
    };

    // Load YouTube API if not already loaded
    if (urlValue && urlValue.includes('youtube') && !window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      // Define the callback function
      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    return () => {
      // Clean up player when component unmounts
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [urlValue, volume]);

  // Update volume when it changes
  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  const addSongMutation = useMutation({
    mutationFn: addSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      toast.success("Song added successfully");
      handleClose();
    },
    onError: (error) => {
      console.log(error);
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          toast.error('This song already exists in your library');
        } else if (error.message.includes('download failed')) {
          toast.error('Failed to download the song. Please check the URL and try again');
        } else if (error.message.includes('unsupported URL')) {
          toast.error('This URL is not supported. Please use YouTube or SoundCloud links only');
        } else {
          toast.error('Failed to add song. Please try again later');
        }
      } else {
        toast.error('An unexpected error occurred');
      }
      handleClose();
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    reset();
    setVideoMetadata({});
    setIsPlaying(false);

    // Stop playback when dialog closes
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo();
    }
  };

  const onSubmit = (data: AddSongInput) => {
    addSongMutation.mutate(data);
  };

  const handleMetadataChange = (metadata: VideoMetadata) => {
    if (Object.keys(metadata).length > 0) {
      setVideoMetadata(prev => ({...prev, ...metadata}));
    }
  };

  const togglePlayback = () => {
    if (!playerRef.current) return;

    const newPlayState = !isPlaying;
    setIsPlaying(newPlayState);

    if (newPlayState) {
      if (playerRef.current.playVideo) {
        playerRef.current.playVideo();
      }
    } else {
      if (playerRef.current.pauseVideo) {
        playerRef.current.pauseVideo();
      }
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const renderUrlTypeIndicator = () => {
    if (!urlValue) return null;

    return (
      <div className="flex items-center gap-2 mt-1 text-xs">
        {urlType === 'youtube' && (
          <>
            <YoutubeIcon className="h-3 w-3 text-red-500" />
            <span className="text-white/70">YouTube URL Detected</span>
          </>
        )}
        {urlType === 'soundcloud' && (
          <>
            <CloudIcon className="h-3 w-3 text-orange-500" />
            <span className="text-white/70">SoundCloud URL Detected</span>
          </>
        )}
        {urlType === 'other' && (
          <>
            <Music className="h-3 w-3 text-blue-500" />
            <span className="text-white/70">Music URL Detected</span>
          </>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-[#0A071A]/95 backdrop-blur-md border-primary/20 rounded-lg sm:max-w-[425px] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Music className="h-5 w-5" />
            Add New Song
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Paste a YouTube, SoundCloud, or Last.fm URL to add a song to your library
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div>
              <Label htmlFor="url" className="text-white/80">Song URL</Label>
              <Input
                id="url"
                className="bg-background/30 border-primary/20 text-white placeholder:text-white/30 focus-visible:ring-primary/50 focus-visible:border-primary/30 h-9"
                {...register("url")}
                placeholder="Paste YouTube, SoundCloud, or Last.fm URL"
                type="url"
                inputMode="url"
                autoComplete="off"
              />
              {renderUrlTypeIndicator()}
              {errors.url && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.url.message}
                </p>
              )}
            </div>
          </div>

          {urlType === 'youtube' && urlValue && videoMetadata.thumbnail && (
            <div className="py-2">
              <div className="rounded border border-primary/20 bg-black/20 overflow-hidden">
                {/* Song Info Section */}
                <div className="flex items-center p-3 relative group"
                     onMouseEnter={handleMouseEnter}
                     onMouseLeave={handleMouseLeave}>
                  <div className="w-20 h-20 flex-shrink-0 mr-3 relative">
                    <img
                      src={videoMetadata.thumbnail}
                      alt={videoMetadata.title || "Video thumbnail"}
                      className="w-full h-full object-cover rounded"
                    />
                    {/* Play/Pause Indicator */}
                    <div
                      className={`absolute inset-0 flex items-center justify-center bg-black/40 rounded transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'} cursor-pointer`}
                      onClick={togglePlayback}
                    >
                      {isPlaying ?
                        <Pause className="h-8 w-8 text-white" /> :
                        <Play className="h-8 w-8 text-white" />
                      }
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white line-clamp-2">
                      {videoMetadata.title || "Loading..."}
                    </h3>

                    {videoMetadata.author && (
                      <p className="text-xs text-white/60 flex items-center gap-1 mt-1">
                        <Users className="h-3 w-3" />
                        {videoMetadata.author}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 justify-end mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="h-9 bg-white/5 hover:bg-white/10 text-white border-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addSongMutation.isPending}
              className="h-9 bg-purple-600/90 hover:bg-purple-600 text-white border-none"
            >
              {addSongMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                </>
              ) : (
                "Add Song"
              )}
            </Button>
          </DialogFooter>
        </form>

        {/* Hidden player container - always render for YouTube URLs */}
        {urlValue && urlType === 'youtube' && (
          <div id="hiddenPlayer" className="hidden" data-play={isPlaying ? 'true' : 'false'} data-volume={volume}>
            <MusicPlayer initialUrl={urlValue} onMetadataChange={handleMetadataChange} isHiddenPlayer={true} />
          </div>
        )}

        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes progress-bar {
              0% { width: 0; }
              100% { width: 60%; }
            }
            .animate-progress-bar {
              animation: progress-bar 30s linear;
              width: 60%;
            }
            .purple-slider [data-orientation="horizontal"] {
              height: 2px;
              background-color: rgba(255, 255, 255, 0.1);
            }
            .purple-slider [data-orientation="horizontal"] > span {
              background-color: rgb(147, 51, 234);
            }
            .purple-slider [role="slider"] {
              background-color: rgb(147, 51, 234);
              width: 10px;
              height: 10px;
            }
          `
        }} />
      </DialogContent>
    </Dialog>
  );
}
