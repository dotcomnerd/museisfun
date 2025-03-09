import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { NumberTicker } from '@/components/ui/anim-number';
import { Download, ListMusic, HardDrive, Clock, Loader2, AlertCircle, PlusCircle } from 'lucide-react';
import { UserStatisticsResponse } from 'muse-shared';
import { Button } from '@/components/ui/button';
import { AddSongDialog } from '@/features/songs/add-song-dialog';
import { CreatePlaylistDialog } from '@/features/playlists/create-dialog';
import {
  TextureCard,
  TextureCardContent
} from '@/components/ui/texture-card';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  museStats: UserStatisticsResponse | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function StatsCards({ museStats, isLoading, isError }: StatsCardsProps) {
  const stats = [
    {
      label: 'Downloads',
      value: museStats?.totalDownloads,
      icon: <Download className="w-6 h-6 text-primary/80" />,
      unit: "",
      colorClass: "before:from-blue-500/20 before:to-blue-600/10 hover:before:from-blue-500/30 hover:before:to-blue-600/20",
      iconBgClass: "bg-blue-500/10",
      link: "/dashboard/downloads",
      emptyAction: (
        <AddSongDialog>
          <Button
            size="sm"
            variant="outline"
            className="mt-2 text-xs gap-1 py-1 h-7 opacity-80 hover:opacity-100"
          >
            <PlusCircle className="h-3 w-3" />
            <span>Add Music</span>
          </Button>
        </AddSongDialog>
      )
    },
    {
      label: '# of Playlists',
      value: museStats?.totalPlaylists,
      icon: <ListMusic className="w-6 h-6 text-primary/80" />,
      unit: "",
      colorClass: "before:from-purple-500/20 before:to-purple-600/10 hover:before:from-purple-500/30 hover:before:to-purple-600/20",
      iconBgClass: "bg-purple-500/10",
      link: "/dashboard/playlists",
      emptyAction: (
        <div onClick={(e) => e.preventDefault()}>
          <CreatePlaylistDialog />
        </div>
      )
    },
    {
      label: 'Storage Used',
      value: museStats?.storageUsed ? parseFloat(museStats.storageUsed.toString()) : 0,
      icon: <HardDrive className="w-6 h-6 text-primary/80" />,
      unit: "MB",
      colorClass: "before:from-green-500/20 before:to-green-600/10 hover:before:from-green-500/30 hover:before:to-green-600/20",
      iconBgClass: "bg-green-500/10",
      link: "/dashboard/settings",
      emptyAction: null
    },
    {
      label: 'Listening Time',
      value: museStats?.totalListeningTime ? parseFloat(museStats.totalListeningTime.toString()) : 0,
      icon: <Clock className="w-6 h-6 text-primary/80" />,
      unit: "h",
      colorClass: "before:from-amber-500/20 before:to-amber-600/10 hover:before:from-amber-500/30 hover:before:to-amber-600/20",
      iconBgClass: "bg-amber-500/10",
      link: "/dashboard/history",
      emptyAction: (
        <AddSongDialog>
          <Button
            size="sm"
            variant="outline"
            className="mt-2 text-xs gap-1 py-1 h-7 opacity-80 hover:opacity-100"
          >
            <PlusCircle className="h-3 w-3" />
            <span>Add Music</span>
          </Button>
        </AddSongDialog>
      )
    }
  ];

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 }
        }
      }}
    >
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: idx * 0.1
              }
            }
          }}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Link to={stat.link}>
            <TextureCard
              className={cn(
                "h-full overflow-hidden relative group shadow-sm hover:shadow-lg transition-all duration-300",
                "before:absolute before:inset-0 before:z-0 before:rounded-[calc(var(--radius)-4px)] before:bg-gradient-to-br before:content-['']",
                stat.colorClass
              )}
            >
              <TextureCardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("rounded-lg p-3 backdrop-blur-sm", stat.iconBgClass)}>
                    {stat.icon}
                  </div>
                  <span className="text-xs font-medium uppercase text-muted-foreground/70 tracking-wider">
                    {stat.label}
                  </span>
                </div>
                <div>
                  {museStats && (
                    <p className="text-3xl md:text-4xl font-bold text-foreground/90">
                      <motion.span
                        initial={{ opacity: 0, x: 5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: typeof stat.value === 'number' ? 0.7 : 0 }}
                      >
                        {typeof stat.value === 'number' ? (
                          stat.value === 0 ? (
                            <span className="text-muted-foreground/60">0</span>
                          ) : (
                            <NumberTicker value={stat.value} />
                          )
                        ) : (
                          <span className="text-muted-foreground/60">0</span>
                        )}
                      </motion.span>
                      {stat.unit && (
                        <motion.span
                          initial={{ opacity: 0, x: 5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: typeof stat.value === 'number' ? 1.2 : 0.5 }}
                          className="text-2xl ml-1 text-muted-foreground/80"
                        >
                          {stat.unit}
                        </motion.span>
                      )}
                    </p>
                  )}
                  {isLoading && (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground/70">Loading...</span>
                    </div>
                  )}
                  {isError && (
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500/70" />
                      <span className="text-muted-foreground/70">Error loading stats</span>
                    </div>
                  )}

                  {museStats && stat.value === 0 && stat.emptyAction && (
                    <div onClick={(e) => e.preventDefault()}>
                      {/* TODO: Add empty action */}
                      {/* {stat.emptyAction} */}
                    </div>
                  )}

                  <div className="h-1.5 w-24 bg-primary/20 rounded-full mt-3 relative overflow-hidden">
                    <motion.div
                      className="absolute top-0 left-0 h-full w-full bg-primary/40"
                      initial={{ x: "-100%" }}
                      animate={{ x: museStats && stat.value && typeof stat.value === 'number' && stat.value > 0 ? "0%" : "-90%" }}
                      transition={{
                        duration: 1.5,
                        delay: 0.5 + idx * 0.2,
                        ease: "easeOut"
                      }}
                    />
                  </div>
                </div>
              </TextureCardContent>
            </TextureCard>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
