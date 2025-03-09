import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import Fetcher from '@/lib/fetcher';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ThumbsUp, MessageCircle, ChevronLeft, ChevronRight, DownloadIcon, Music, YoutubeIcon, Play, Pause, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/video-components';
import { PiDownloadSimple } from 'react-icons/pi';
import { cn, extractYouTubeId, fetchYouTubeMetadata } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import MusicPlayer, { VideoMetadata } from '@/features/songs/preview-player';
import { Slider } from '@/components/ui/slider';

export interface YouTubeVideo {
  title: string;
  thumbnail: string;
  watchUrl: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  duration: string;
  likeCount: string;
  commentCount: string;
  description: string;
  channelThumbnail?: string;
}

export function YouTubeSearch() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showInitialHint, setShowInitialHint] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedQuery = useDebounce(query, 300);
  const resultsPerPage = 3;
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isYouTubeUrl, setIsYouTubeUrl] = useState(false);
  const [detectedVideoId, setDetectedVideoId] = useState<string | null>(null);
  const [, setPreviewMetadata] = useState<VideoMetadata>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  // Check if user has any songs to determine if they're new
  const { data: songCount } = useQuery<number>({
    queryKey: ["song-count"],
    queryFn: async () => {
      try {
        const { data } = await Fetcher.getInstance().get<{ count: number }>("/api/songs/aggregate/count");
        return data.count;
      } catch (error) {
        console.error("Failed to get song count:", error);
        return 0;
      }
    },
  });

  // Show hint for new users
  useEffect(() => {
    if (songCount === 0) {
      const timer = setTimeout(() => {
        setShowInitialHint(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [songCount]);

  // Check if input is a YouTube URL
  const checkForYouTubeUrl = useCallback((input: string) => {
    const videoId = extractYouTubeId(input);
    setDetectedVideoId(videoId);
    setIsYouTubeUrl(!!videoId);
    return videoId;
  }, []);

  const handleMetadataChange = useCallback((metadata: VideoMetadata) => {
    if (Object.keys(metadata).length > 0) {
      setPreviewMetadata(prev => ({...prev, ...metadata}));
    }
  }, []);

  const togglePlayback = useCallback(() => {
    const newPlayState = !isPlaying;
    setIsPlaying(newPlayState);

    if (playerRef.current) {
      playerRef.current.setAttribute('data-play', newPlayState.toString());
      playerRef.current.setAttribute('data-volume', volume.toString());
    }
  }, [isPlaying, volume]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);

    if (playerRef.current) {
      playerRef.current.setAttribute('data-volume', newVolume.toString());
    }
  }, []);

  const searchYouTube = useCallback(async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([]);
      setShowResults(false);
      setIsYouTubeUrl(false);
      setDetectedVideoId(null);
      return;
    }

    // Check if the query is a YouTube URL
    const videoId = checkForYouTubeUrl(searchQuery);

    if (videoId) {
      try {
        setIsLoading(true);
        // Fetch metadata for the specific video
        let metadata: VideoMetadata = {};

        try {
          metadata = await fetchYouTubeMetadata(videoId);
        } catch (error) {
          console.error("Failed to fetch YouTube metadata:", error);
        }

        const videoResult: YouTubeVideo = {
          title: metadata.title || "YouTube Video",
          thumbnail: metadata.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          watchUrl: `https://youtube.com/watch?v=${videoId}`,
          channelTitle: metadata.author || "YouTube Channel",
          publishedAt: new Date().toISOString(),
          viewCount: metadata.viewCount || "0",
          duration: metadata.duration?.toString() || "0:00",
          likeCount: "0",
          commentCount: "0",
          description: "Video from YouTube",
          channelThumbnail: undefined
        };

        setResults([videoResult]);
        setShowResults(true);
        setCurrentPage(1);
        setIsLoading(false);
        return;
      } catch (error) {
        console.error("Failed to fetch YouTube video metadata:", error);
      }
    }

    // Continue with regular search if not a URL or if metadata fetch failed
    try {
      setIsLoading(true);
      if (import.meta.env.DEV) {
        setTimeout(() => {
          const mockResults: YouTubeVideo[] = Array(10).fill(null).map((_, i) => ({
            title: `Mock Result ${i + 1}: ${searchQuery} - Music Video`,
            thumbnail: `https://picsum.photos/id/${i + 10}/320/180`,
            watchUrl: `https://youtube.com/watch?v=mock${i}`,
            channelTitle: `Artist ${i + 1}`,
            publishedAt: new Date().toISOString(),
            viewCount: Math.floor(Math.random() * 10000000).toString(),
            duration: `${Math.floor(Math.random() * 5) + 1}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}`,
            likeCount: Math.floor(Math.random() * 500000).toString(),
            commentCount: Math.floor(Math.random() * 50000).toString(),
            description: `This is a mock description for ${searchQuery} result ${i + 1}`,
            channelThumbnail: `https://picsum.photos/id/${i + 50}/48/48`
          }));
          setResults(mockResults);
          setShowResults(true);
          setCurrentPage(1);
          setIsLoading(false);
        }, 500);
      } else {
        const api = Fetcher.getInstance();
        await api.get("/api/youtube/search", {
          params: {
            q: searchQuery,
            limit: 10,
          },
        }).then((response) => {
          setResults(response.data);
          setShowResults(true);
          setCurrentPage(1);
        }).catch((error) => {
          console.error("Failed to search YouTube:", error);
          setResults([]);
        }).finally(() => {
          setIsLoading(false);
        });
      }
    } catch (error) {
      console.error("Failed to search YouTube:", error);
      setResults([]);
      setIsLoading(false);
    }
  }, [checkForYouTubeUrl]);

  useEffect(() => {
    searchYouTube(debouncedQuery);
  }, [debouncedQuery, searchYouTube]);

  const handleSelect = useCallback(async (video: YouTubeVideo) => {
    try {
      if (import.meta.env.DEV) {
        setQuery("");
        setShowResults(false);
        toast.success("Added to library", {
          description: `"${video.title}" has been added to your library`,
          duration: 3000,
        });
      } else {
        const api = Fetcher.getInstance();
        api.post("/api/songs", {
          mediaUrl: video.watchUrl,
        });
        setQuery("");
        setShowResults(false);
        toast.success("Added to library", {
          description: `"${video.title}" has been added to your library`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Failed to process video:", error);
      toast.error("Failed to add to library", {
        description: "There was an error adding this song to your library",
      });
    }
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const paginatedResults = results.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatViews = (viewCount: string) => {
    const count = parseInt(viewCount, 10);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} views`;
  };

  const formatCount = (count: string) => {
    const num = parseInt(count, 10);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowInitialHint(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus input if the initial hint is showing
  useEffect(() => {
    if (showInitialHint && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [showInitialHint]);

  const handleFocus = () => {
    if (songCount === 0 && !showResults && !debouncedQuery) {
      setShowInitialHint(true);
    }
  };

  // When URL is detected, show a different UI
  const renderUrlTypeIndicator = () => {
    if (!query) return null;

    if (isYouTubeUrl && detectedVideoId) {
      return (
        <div className="flex items-center gap-2 mt-2 ml-3 text-xs absolute">
          <YoutubeIcon className="h-3 w-3 text-red-500" />
          <span className="text-muted-foreground">YouTube URL Detected</span>
        </div>
      );
    }

    return null;
  };

  // Render preview player UI for detected YouTube URLs
  const renderPreviewPlayer = () => {
    if (!isYouTubeUrl || !detectedVideoId || results.length === 0) return null;

    const video = results[0];

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30
        }}
        className="absolute mt-3 left-0 right-0 bg-background/90 border border-border/50 rounded-xl shadow-xl overflow-hidden backdrop-blur-md"
      >
        <div className="p-4 flex gap-4">
          <div className="relative w-[180px] h-[101px] flex-shrink-0">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover rounded-md"
            />
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors cursor-pointer rounded-md"
              onClick={togglePlayback}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 text-white" />
              ) : (
                <Play className="h-8 w-8 text-white" />
              )}
            </div>
            {video.duration !== "0:00" && (
              <div className="absolute bottom-1 right-1 text-xs bg-black/70 text-white px-1 rounded">
                {video.duration}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            <h3 className="font-medium line-clamp-1 text-sm">{video.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{video.channelTitle}</p>

            <div className="mt-auto flex items-center gap-4">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 hover:bg-white/10 flex items-center gap-2"
                  onClick={() => handleSelect(video)}
                >
                  <DownloadIcon className="h-4 w-4" />
                  <span className="text-xs">Add to Library</span>
                </Button>

                <div className="relative ml-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-white/10"
                    onClick={() => setShowVolumeControl(!showVolumeControl)}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>

                  {showVolumeControl && (
                    <div className="absolute -left-10 -bottom-14 p-3 bg-background border border-border/50 rounded-lg shadow-xl z-50" onMouseLeave={() => setShowVolumeControl(false)}>
                      <Slider
                        value={[volume]}
                        max={100}
                        step={1}
                        orientation="horizontal"
                        className="w-24"
                        onValueChange={handleVolumeChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden player container for YouTube preview */}
        <div
          id="hiddenPlayer"
          ref={playerRef}
          className="hidden"
          data-play={isPlaying ? 'true' : 'false'}
          data-volume={volume}
        >
          <MusicPlayer initialUrl={video.watchUrl} onMetadataChange={handleMetadataChange} isHiddenPlayer={true} />
        </div>
      </motion.div>
    );
  };

  return (
    <div ref={searchRef} className="relative z-50 max-w-3xl mx-auto mb-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 20,
          delay: 0.2
        }}
        className="relative"
      >
        <div className="relative group">
          <div
            className={cn(
              "absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/30 rounded-full blur opacity-20 transition duration-2000",
              (showInitialHint || query) ? "opacity-40" : "group-hover:opacity-40 group-hover:duration-2000"
            )}
          ></div>
          <Input
            ref={inputRef}
            type="text"
            placeholder={isYouTubeUrl ? "YouTube URL detected..." : "Search for music..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            className={cn(
              "h-14 md:h-16 pl-5 pr-12 text-lg rounded-full bg-background/80 backdrop-blur-md border-border/50 relative ring-primary/20 ring-1",
              "focus-visible:ring-primary/100 focus-visible:ring-1",
              isYouTubeUrl ? "border-red-500/30 ring-red-500/20" : ""
            )}
          />
        </div>
        <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground" />
        {renderUrlTypeIndicator()}
      </motion.div>

      <AnimatePresence>
        {isYouTubeUrl && detectedVideoId ? renderPreviewPlayer() : null}

        {showInitialHint && !showResults && !query && !isYouTubeUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
            className="absolute mt-3 left-0 right-0 bg-background/80 border border-border/50 rounded-xl shadow-xl overflow-hidden backdrop-blur-md p-4"
          >
            <div className="flex items-start gap-4 p-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">Start building your library</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Search for your favorite songs from YouTube, SoundCloud, or other supported platforms
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded">1</span>
                    <span>Search for a song</span>
                  </div>
                  <span>→</span>
                  <div className="flex items-center gap-1">
                    <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded">2</span>
                    <span>Click download</span>
                  </div>
                  <span>→</span>
                  <div className="flex items-center gap-1">
                    <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded">3</span>
                    <span>Enjoy your music!</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2 p-2 bg-background/50 rounded-lg">
              Try searching for: <span className="text-primary font-medium cursor-pointer hover:underline" onClick={() => setQuery("lofi beats")}>lofi beats</span> • <span className="text-primary font-medium cursor-pointer hover:underline" onClick={() => setQuery("piano music")}>piano music</span> • <span className="text-primary font-medium cursor-pointer hover:underline" onClick={() => setQuery("workout playlist")}>workout playlist</span>
            </div>
          </motion.div>
        )}

        {showResults && !isYouTubeUrl && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
            className="absolute mt-3 left-0 right-0 bg-background/80 border border-border/50 rounded-xl shadow-xl overflow-hidden backdrop-blur-md"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <LoadingSpinner isLoading={true} />
              </div>
            ) : results.length === 0 && debouncedQuery ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <p className="text-lg">No results found for "{debouncedQuery}"</p>
                <p className="text-sm">Try different keywords or check your spelling</p>
              </div>
            ) : (
              <>
                <ScrollArea className="max-h-[60vh] overflow-y-auto">
                  <div className="p-2">
                    {paginatedResults.map((video, idx) => (
                      <motion.div
                        key={video.watchUrl}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: idx * 0.05
                        }}
                        className="mb-3 last:mb-0"
                      >
                        <Card
                          className={cn(
                            "w-full overflow-hidden transition-all duration-200 hover:shadow-md video-card bg-background/50 backdrop-blur-sm border-border/40",
                            "cursor-pointer"
                          )}
                          onMouseEnter={() => setHoveredVideo(video.watchUrl)}
                          onMouseLeave={() => setHoveredVideo(null)}
                        >
                          <div className="flex h-[120px]">
                            <div className="w-[213px] relative overflow-hidden thumbnail-container">
                              <AspectRatio ratio={16/9} className="h-full">
                                <img
                                  src={video.thumbnail}
                                  alt={video.title}
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute bottom-1 right-1 bg-background/80 text-primary px-1 py-0.5 text-xs rounded font-medium backdrop-blur-sm">
                                  {video.duration}
                                </div>
                              </AspectRatio>
                              {hoveredVideo === video.watchUrl && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center"
                                >
                                  <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 400,
                                      damping: 10
                                    }}
                                    className="rounded-full bg-primary/90 p-2 transform transition-transform hover:scale-110"
                                  >
                                    <PiDownloadSimple className="h-5 w-5 text-white" />
                                  </motion.div>
                                </motion.div>
                              )}
                            </div>
                            <div className="flex-1 p-3 min-w-0">
                              <div>
                                <h3 className="font-medium line-clamp-2 text-xs leading-tight">{video.title}</h3>
                                <div className="flex items-center gap-1 mt-1.5">
                                  <span className="text-[12px] text-muted-foreground line-clamp-1">{video.channelTitle}</span>
                                  <span className="text-[12px] text-muted-foreground">•</span>
                                  <span className="text-[12px] text-muted-foreground">{formatViews(video.viewCount)}</span>
                                </div>
                                <div className="flex gap-3 text-[11px] text-muted-foreground mt-1">
                                  <div className="flex items-center gap-1">
                                    <ThumbsUp className="h-3 w-3" />
                                    <span>{formatCount(video.likeCount)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MessageCircle className="h-3 w-3" />
                                    <span>{formatCount(video.commentCount)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleSelect(video)}
                              className="h-full w-[50px] rounded-none text-xs font-medium flex-col gap-1"
                              variant="ghost"
                            >
                              <DownloadIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border/30 p-2 bg-background/70 backdrop-blur-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
