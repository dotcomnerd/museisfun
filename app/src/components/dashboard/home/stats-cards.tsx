import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { NumberTicker } from '@/components/ui/anim-number';
import { Download, ListMusic, HardDrive, Clock, Loader2, AlertCircle, PlusCircle } from 'lucide-react';
import { UserStatisticsResponse } from 'muse-shared';
import { Button } from '@/components/ui/button';
import { AddSongDialog } from '@/features/songs/add-song-dialog';
import { CreatePlaylistDialog } from '@/features/playlists/create-dialog';

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
      icon: <Download className="w-6 h-6 text-primary" />,
      unit: "",
      bgColor: "from-blue-500/20 to-blue-600/10",
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
      icon: <ListMusic className="w-6 h-6 text-primary" />,
      unit: "",
      bgColor: "from-purple-500/20 to-purple-600/10",
      link: "/dashboard/playlists",
      emptyAction: (
        <div onClick={(e) => e.preventDefault()}>
          <CreatePlaylistDialog />
        </div>
      )
    },
    {
      label: 'Storage Used',
      value: museStats?.storageUsed,
      icon: <HardDrive className="w-6 h-6 text-primary" />,
      unit: "MB",
      bgColor: "from-green-500/20 to-green-600/10",
      link: "/dashboard/settings",
      emptyAction: null
    },
    {
      label: 'Listening Time',
      value: museStats?.totalListeningTime,
      icon: <Clock className="w-6 h-6 text-primary" />,
      unit: "h",
      bgColor: "from-amber-500/20 to-amber-600/10",
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
            <Card className={`bg-gradient-to-br ${stat.bgColor} hover:shadow-xl transition-all duration-500 border-border/30 backdrop-blur-sm overflow-hidden relative h-full group`}>
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-primary/5 blur-xl"></div>
              <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="rounded-lg bg-background/40 p-3 backdrop-blur-sm">
                    {stat.icon}
                  </div>
                  <span className="text-xs font-medium uppercase text-muted-foreground tracking-wider">
                    {stat.label}
                  </span>
                </div>
                <div>
                  {museStats && (
                    <p className="text-3xl md:text-4xl font-bold text-foreground">
                      <motion.span
                        initial={{ opacity: 0, x: 5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: typeof stat.value === 'number' ? 0.7 : 0 }}
                      >
                        {typeof stat.value === 'number' ? (
                          stat.value === 0 ? (
                            <span className="text-muted-foreground/80">0</span>
                          ) : (
                            <NumberTicker value={stat.value} />
                          )
                        ) : (
                          <span className="text-muted-foreground/80">0</span>
                        )}
                      </motion.span>
                      {stat.unit && (
                        <motion.span
                          initial={{ opacity: 0, x: 5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: typeof stat.value === 'number' ? 1.2 : 0.5 }}
                          className="text-2xl ml-1 text-muted-foreground"
                        >
                          {stat.unit}
                        </motion.span>
                      )}
                    </p>
                  )}
                  {isLoading && (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">Loading...</span>
                    </div>
                  )}
                  {isError && (
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-muted-foreground">Error loading stats</span>
                    </div>
                  )}

                  {museStats && stat.value === 0 && stat.emptyAction && (
                    <div onClick={(e) => e.preventDefault()}>
                      {/* TODO: Add empty action */}
                      {/* {stat.emptyAction} */}
                    </div>
                  )}

                  <div className="h-1.5 w-24 bg-primary/30 rounded-full mt-3 relative overflow-hidden">
                    <motion.div
                      className="absolute top-0 left-0 h-full w-full bg-primary/60"
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
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
