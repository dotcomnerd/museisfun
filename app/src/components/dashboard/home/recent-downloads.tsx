import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Play, ChevronRight, Music, PlusCircle } from 'lucide-react';
import { GetRecentDownloadsResponse } from 'muse-shared';
import { useNavigate } from 'react-router';
import { Playlist } from '@/lib/types';
import { AddSongDialog } from '@/features/songs/add-song-dialog';
import {
  TextureCard,
  TextureCardContent,
  TextureCardHeader,
  TextureCardTitle,
  TextureCardDescription
} from '@/components/ui/texture-card';
import { cn } from '@/lib/utils';

// Custom wrapper that ensures dialog works
function CustomAddSongDialog({ children }: { children: React.ReactNode }) {
  // We don't actually need the isOpen state, just need to keep
  // consistent DOM structure for querying
  const addSongDialog = document.querySelector('[data-test-id="add-song-dialog"]');

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If the regular dialog exists, trigger it
    if (addSongDialog) {
      const button = addSongDialog.querySelector('button');
      if (button) button.click();
    }
  };

  return (
    <div onClick={handleClick} className="z-50 relative">
      {children}
    </div>
  );
}

interface RecentDownloadsProps {
  recentlyDownloaded: GetRecentDownloadsResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initializeAudio: (songs: Array<{ _id: string, [key: string]: any }>, index: number, playlist?: Playlist) => void | Promise<void>;
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
      {/* Hidden reference dialog */}
      <div className="hidden" data-test-id="add-song-dialog">
        <AddSongDialog>
          <button>Hidden</button>
        </AddSongDialog>
      </div>

      <TextureCard
        className={cn(
          "h-full overflow-hidden relative group shadow-sm hover:shadow-lg transition-all duration-300",
          "before:absolute before:inset-0 before:z-0 before:rounded-[calc(var(--radius)-4px)] before:bg-gradient-to-br before:content-['']",
          "before:from-blue-500/10 before:to-blue-600/5 hover:before:from-blue-500/20 hover:before:to-blue-600/10"
        )}
      >
        <TextureCardHeader className="pb-2 space-y-1 relative z-10">
          <TextureCardTitle className="flex items-center gap-2 text-2xl">
            <span className="bg-blue-500/10 p-1.5 rounded-lg">
              <Download className="h-5 w-5 text-blue-500/90" />
            </span>
            Recent Downloads
          </TextureCardTitle>
          <TextureCardDescription>Your latest tracks</TextureCardDescription>
        </TextureCardHeader>
        <TextureCardContent className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
          {isError ? (
            <div className="text-red-500/80 text-center py-4">Error loading recent downloads</div>
          ) : isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500/60" />
            </div>
          ) : isEmpty ? (
            <motion.div
              className="flex flex-col items-center justify-center py-8 px-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="rounded-full bg-blue-500/10 p-4 mb-4">
                <Music className="h-10 w-10 text-blue-500/70" />
              </div>
              <h3 className="text-lg font-medium mb-1">No downloads yet</h3>
              <p className="text-muted-foreground/80 text-sm mb-6">Add your first song to start building your library</p>

              <CustomAddSongDialog>
                <Button
                  className="gap-2 bg-blue-500/80 hover:bg-blue-600/80 text-white border-blue-400/20 relative z-50"
                  size="sm"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Your First Song
                </Button>
              </CustomAddSongDialog>

              <p className="text-muted-foreground/70 text-xs mt-4">
                Paste a YouTube, SoundCloud, or other supported URL to add music
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3 relative z-10">
              {recentlyDownloaded?.map((track: GetRecentDownloadsResponse[number], index: number) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 group p-3 rounded-xl hover:bg-accent/10 transition-all duration-300 cursor-pointer border border-transparent hover:border-border/30"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05
                  }}
                  whileHover={{ x: 5, backgroundColor: "rgba(var(--accent)/0.1)" }}
                  onClick={() => initializeAudio([...recentlyDownloaded], index)}
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="bg-white/80 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Play className="h-4 w-4 text-blue-500/90 fill-blue-500/80" />
                      </motion.div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-foreground/90">{track.title}</p>
                    <p className="text-sm text-muted-foreground/70 truncate">{track.uploader}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TextureCardContent>
        <div className="px-6 py-3 mt-2 border-t border-border/20 bg-background/20 backdrop-blur-sm relative z-10">
          {isEmpty ? (
            <CustomAddSongDialog>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between hover:bg-blue-500/10"
              >
                <span>Add new music</span>
                <PlusCircle className="h-4 w-4" />
              </Button>
            </CustomAddSongDialog>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between hover:bg-blue-500/10"
              onClick={() => navigate("/dashboard/downloads")}
            >
              <span>View all downloads</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TextureCard>
    </motion.div>
  );
}
