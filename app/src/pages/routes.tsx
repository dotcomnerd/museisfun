import { AuthLayout, LoginCard, RegisterCard } from '@/components/auth';
import { FavoritesView } from '@/features/favorites/view';
import { SongsPage } from '@/features/songs/dashboard/page';
import { SoundCloudSongsView } from '@/features/songs/soundcloud/view';
import { YouTubeSongsView } from '@/features/songs/youtube/view';
import { DashboardLayout } from '@/layout/dashboard-layout';
import NotFoundPage from '@/layout/static/fourohfour';
import { AboutPage } from '@/pages/about-page';
import { HelpPage } from '@/pages/help-page';
import { DashboardHome } from '@/pages/home-page';
import { LandingPage } from '@/pages/landing-page';
import { PlaylistsPage } from '@/pages/playlist-page';
import { ProfilePage } from '@/pages/profile-page';
import { PublicPlaylistPage } from '@/pages/public-playlist-page';
import { PublicProfilePage } from '@/pages/public-profile-page';
import { SettingsPage } from '@/pages/settings-page';
import { SinglePlaylistPage } from '@/pages/single-playlist-page';
import { Route, Routes } from 'react-router';

// I hate commenting like this generally, but this will help me keep track of the routes
export function MuseRouting() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route index element={<LandingPage />} />
      {/* About Page */}
      <Route path="about" element={<AboutPage />} />

      {/* TODO: Add compliance page(s) (terms, privacy, etc.) */}

      {/* Public Playlist Page */}
      <Route path="playlists/:idOrSlug" element={<PublicPlaylistPage />} />
      {/* Public Profile Page */}
      <Route path="profile/:username" element={<PublicProfilePage />} />
      {/* Auth Layout */}
      <Route element={<AuthLayout />}>
        {/* Login Card */}
        <Route path="login" element={<LoginCard />} />
        {/* Register Card */}
        <Route path="register" element={<RegisterCard />} />
      </Route>
      {/* Dashboard Layout */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* Dashboard Home */}
        <Route index element={<DashboardHome />} />
        {/* Favorites Routes */}
        <>
          <Route path="favorites" element={<FavoritesView />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="songs" element={<SongsPage />} />
        </>
        {/* Profile Routes */}
        <>
          <Route path="profile" element={<ProfilePage />} />
        </>
        {/* Playlists Routes */}
        <>
          <Route path="playlists" element={<PlaylistsPage />} />
          <Route path="playlists/:id" element={<SinglePlaylistPage />} />
        </>
        {/* Settings Routes */}
        <Route path="settings" element={<SettingsPage />} />
        {/* Songs Routes */}
        <>
          <Route path="songs/youtube" element={<YouTubeSongsView />} />
          <Route path="songs/soundcloud" element={<SoundCloudSongsView />} />
        </>
        {/* Not Found Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      {/* Not Found Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}