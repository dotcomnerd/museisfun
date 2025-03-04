import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import Fetcher from '@/lib/fetcher';
import { Song } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const api = Fetcher.getInstance();

export function DemoPlayer({ className, shouldPlay }: { className?: string, shouldPlay: boolean }) {
  const [currentSong, setCurrentSong] = useState<Partial<Song> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume,] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchRandomSong = async () => {
      try {
        const { data: song } = await api.get(`/api/songs/demo/random`);

        setCurrentSong({
          _id: song._id,
          title: song.title,
          uploader: song.uploader,
          thumbnail: song.thumbnail,
          stream_url: song.stream_url,
          duration: song.duration
        });

        if (audioRef.current) {
          audioRef.current.src = song.stream_url;
          audioRef.current.load();
        }
      } catch (error) {
        console.error("Error fetching random song:", error);
      }
    };

    fetchRandomSong();
  }, []);

  useEffect(() => {
    if (!audioRef.current && currentSong?.stream_url) {
      audioRef.current = new Audio(currentSong.stream_url);
      audioRef.current.volume = volume;

      const audio = audioRef.current;
      audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
      audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));

      return () => {
        audio.pause();
        audio.src = '';
      };
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [currentSong, volume]);

  useEffect(() => {
    if (shouldPlay && !isPlaying && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [shouldPlay]);

  const playPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (!currentSong) return null;

  const progress = (currentTime / duration) * 100;

  return (
    <Card className={cn("w-full bg-background/50 backdrop-blur-sm", className)}>
      {!isMobile && (
        <CardHeader>
          <CardTitle>
            <h2 className="text-4xl font-bold">Try it out...like right now</h2>
          </CardTitle>
          <CardDescription>
            <div className="flex flex-col gap-2">
              <div className="pl-4 border-l-4 border-purple-500">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  This is a minified example of the player.
                </p>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "relative flex flex-col items-center justify-center w-full mx-auto",
            !isMobile && "rounded-xl bg-background border border-border"
          )}
        >
          <div className={cn(
            "flex items-center p-6 gap-4 w-full",
            isMobile ? "flex-col" : "flex-row"
          )}>
            <div className={cn(
              "relative flex-shrink-0",
              isMobile ? "size-48 w-full" : "size-32"
            )}>
              <img
                src={currentSong.thumbnail}
                alt={currentSong.title}
                className="w-full h-full object-cover rounded-md"
              />
            </div>

            <div className={cn(
              "space-y-2",
              isMobile ? "w-full" : "flex-1"
            )}>
              <div className={cn(
                isMobile ? "text-center" : ""
              )}>
                <h3 className="text-md font-medium text-foreground">{currentSong.title}</h3>
                <p className="text-sm text-muted-foreground">{currentSong.uploader}</p>
              </div>

              <div className="space-y-1">
                <div className="h-[4px] bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.floor(currentTime)}s</span>
                  <span>{Math.floor(duration)}s</span>
                </div>
              </div>

              <div className={cn(
                "flex items-center",
                isMobile ? "justify-center gap-2" : "justify-between"
              )}>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-primary">
                    <Shuffle className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-primary">
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-lg p-1 bg-primary/10 hover:bg-primary/20"
                    onClick={playPause}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-primary">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-primary">
                    <Repeat className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-primary"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
