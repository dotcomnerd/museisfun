import { useEffect } from 'react';
import { useSidebarToggle } from '@/hooks/use-sidebar-toggle';
import { useUser } from '@/hooks/use-user';
import { useAudioStore, usePlayerControls } from '@/stores/audioStore';
import { useQuery } from '@tanstack/react-query';
import { GetMostPlayedPlaylistsResponse, GetRecentDownloadsResponse, UserStatisticsResponse } from 'muse-shared';
import { useStore } from 'zustand';
import Fetcher from '@/lib/fetcher';
import { Song } from '@/lib/types';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { WelcomeMessage } from '@/components/dashboard/home/welcome-message';
import { YouTubeSearch } from '@/components/search/youtube-search';
import { StatsCards } from '@/components/dashboard/home/stats-cards';
import { RecentDownloads } from '@/components/dashboard/home/recent-downloads';
import { FavoriteTracks } from '@/components/dashboard/home/favorite-tracks';
import { PopularPlaylists } from '@/components/dashboard/home/popular-playlists';

export function DashboardHome() {
  const sidebar = useStore(useSidebarToggle, (state) => state);
  const user = useUser();
  const { initializeAudio } = useAudioStore();
  const { playSong } = usePlayerControls();

  // Add keyboard shortcut for sidebar toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
        e.preventDefault();
        sidebar?.setIsOpen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebar]);

  // User stats queries
  const {
    data: museStats,
    isLoading: museStatsLoading,
    isError: museStatsError
  } = useQuery<UserStatisticsResponse>({
    queryKey: ["muse-stats"],
    queryFn: async () => {
      const { data } = await Fetcher.getInstance().get<UserStatisticsResponse>("/users/data/stats");
      return data;
    },
    enabled: !!user?.data?._id,
  });

  const {
    data: mostPlayedPlaylists,
    isLoading: mostPlayedPlaylistsLoading,
    isError: mostPlayedPlaylistsError
  } = useQuery<GetMostPlayedPlaylistsResponse>({
    queryKey: ["most-played-playlists"],
    queryFn: async () => {
      const { data } = await Fetcher.getInstance().get<GetMostPlayedPlaylistsResponse>(`/api/playlists/${user?.data?._id}/most-played`);
      return data;
    },
    enabled: !!user?.data?._id,
  });

  const {
    data: recentlyDownloaded,
    isLoading: recentlyDownloadedLoading,
    isError: recentlyDownloadedError
  } = useQuery<GetRecentDownloadsResponse>({
    queryKey: ["recently-downloaded"],
    queryFn: async () => {
      const { data } = await Fetcher.getInstance().get<GetRecentDownloadsResponse>("/api/songs/downloads/recent");
      return data;
    },
    enabled: !!user?.data?._id,
  });

  const {
    data: favoriteTracks,
    isLoading: favoriteTracksLoading,
    isError: favoriteTracksError
  } = useQuery<Song[]>({
    queryKey: ["favorite-tracks"],
    queryFn: async () => {
      const { data } = await Fetcher.getInstance().get<Song[]>("/users/media/favorite/song");
      return data;
    },
    enabled: !!user?.data?._id,
  });

  if (!sidebar) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-background/40 via-background/30 to-background/20">
          <DashboardHeader />

          <main className="flex-1 overflow-x-hidden">
            <div className="container px-4 py-6 md:py-10 max-w-7xl mx-auto">
              <WelcomeMessage username={user?.data?.username} />
              <YouTubeSearch />

              <StatsCards
                museStats={museStats}
                isLoading={museStatsLoading}
                isError={museStatsError}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                <RecentDownloads
                  recentlyDownloaded={recentlyDownloaded}
                  isLoading={recentlyDownloadedLoading}
                  isError={recentlyDownloadedError}
                  initializeAudio={initializeAudio}
                />

                <FavoriteTracks
                  favoriteTracks={favoriteTracks}
                  isLoading={favoriteTracksLoading}
                  isError={favoriteTracksError}
                  initializeAudio={initializeAudio}
                  playSong={playSong}
                />
              </div>

              <PopularPlaylists
                mostPlayedPlaylists={mostPlayedPlaylists}
                isLoading={mostPlayedPlaylistsLoading}
                isError={mostPlayedPlaylistsError}
                initializeAudio={initializeAudio}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
