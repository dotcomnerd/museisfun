import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Play, ChevronRight, Music, PlusCircle } from 'lucide-react';
import { GetRecentDownloadsResponse } from 'muse-shared';
import { useNavigate } from 'react-router';
import { Playlist } from '@/lib/types';
import { AddSongDialog } from '@/features/songs/add-song-dialog';

interface RecentDownloadsProps {
  recentlyDownloaded: GetRecentDownloadsResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  initializeAudio: (songs: any[], index: number, playlist?: Playlist) => void | Promise<void>;
}

export function RecentDownloads({
  recentlyDownloaded,
  isLoading,
  isError,
  initializeAudio
}: RecentDownloadsProps) {
  const navigate = useNavigate();

  // Check if there are no downloads
  const isEmpty = !isLoading && !isError && (!recentlyDownloaded || recentlyDownloaded.length === 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.3
      }}
    >
      <Card className="bg-gradient-to-br from-background/30 to-background/10 hover:shadow-xl transition-all duration-500 border-border/30 backdrop-blur-sm h-full overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-blue-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-2xl flex items-center gap-2">
            <span className="bg-primary/10 p-1.5 rounded-lg">
              <Download className="h-5 w-5 text-primary" />
            </span>
            Recent Downloads
          </CardTitle>
          <CardDescription>Your latest tracks</CardDescription>
        </CardHeader>
        <CardContent className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
          {isError ? (
            <div className="text-red-500 text-center py-4">Error loading recent downloads</div>
          ) : isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isEmpty ? (
            <motion.div
              className="flex flex-col items-center justify-center py-8 px-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Music className="h-10 w-10 text-primary/70" />
              </div>
              <h3 className="text-lg font-medium mb-1">No downloads yet</h3>
              <p className="text-muted-foreground text-sm mb-6">Add your first song to start building your library</p>

              <AddSongDialog>
                <Button
                  className="gap-2"
                  size="sm"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Your First Song
                </Button>
              </AddSongDialog>

              <p className="text-muted-foreground text-xs mt-4">
                Paste a YouTube, SoundCloud, or other supported URL to add music
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {recentlyDownloaded?.map((track: GetRecentDownloadsResponse[number], index: number) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 group p-3 rounded-xl hover:bg-accent/20 transition-all duration-300 cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05
                  }}
                  whileHover={{ x: 5, backgroundColor: "rgba(var(--accent)/0.2)" }}
                  onClick={() => initializeAudio([...recentlyDownloaded], index)}
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="bg-white/90 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Play className="h-4 w-4 text-primary fill-primary" />
                      </motion.div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{track.uploader}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
        <div className="px-6 py-3 border-t border-border/30 bg-background/40 backdrop-blur-sm">
          {isEmpty ? (
            <AddSongDialog>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between hover:bg-background/60"
              >
                <span>Add new music</span>
                <PlusCircle className="h-4 w-4" />
              </Button>
            </AddSongDialog>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between hover:bg-background/60"
              onClick={() => navigate("/dashboard/downloads")}
            >
              <span>View all downloads</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
