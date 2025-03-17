import { useEffect } from 'react';
import { useSidebarToggle } from '@/hooks/use-sidebar-toggle';
import { useUser } from '@/hooks/use-user';
import { useAudioStore, usePlayerControls } from '@/stores/audioStore';
import { useQuery } from '@tanstack/react-query';
import { GetMostPlayedPlaylistsResponse, GetRecentDownloadsResponse } from 'muse-shared';
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

/**
 * Dashboard Home Page
 *
 * The entry point for the dashboard.
 * It displays:
 * - A welcome message
 * - A YouTube search bar
 * - Stats cards (most played playlists, recently downloaded songs, favorite tracks, storage usage)
 * - A list of the user's most played playlists
 * - A list of the user's recently downloaded songs
 * - A list of the user's favorite tracks
 *
 * @returns {JSX.Element} The DashboardHome component
 */
export function DashboardHome(): JSX.Element {
  const sidebar = useStore(useSidebarToggle, (state) => state);
  const user = useUser();
  const { initializeAudio } = useAudioStore();
  const { playSong } = usePlayerControls();

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
    staleTime: 5 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
  });

  if (!sidebar) return <></>;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-background/40 via-background/30 to-background/20">
          <DashboardHeader />
          <main className="flex-1 overflow-x-hidden">
            <div className="container px-4 py-6 md:py-10 max-w-7xl mx-auto">
              <WelcomeMessage username={user?.data?.username} />
              <YouTubeSearch />
              <StatsCards />
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
