import { AuthLayout, LoginCard, RegisterCard } from '@/components/auth';
import { SEO } from '@/components/seo';
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
      <Route index element={<>
        <SEO title="Welcome" description="Welcome to Muse - Your Personal Music Dashboard" path="/" />
        <LandingPage />
      </>} />
      {/* About Page */}
      <Route path="about" element={<>
        <SEO title="About" description="Learn more about Muse and its features" path="/about" />
        <AboutPage />
      </>} />

      {/* TODO: Add compliance page(s) (terms, privacy, etc.) */}

      {/* Public Playlist Page */}
      <Route path="playlists/:idOrSlug" element={<>
        <SEO title="Public Playlist" description="View and listen to this public playlist on Muse" />
        <PublicPlaylistPage />
      </>} />
      {/* Public Profile Page */}
      <Route path="profile/:username" element={<>
        <SEO title="Profile" description="View this user's public profile and playlists on Muse" />
        <PublicProfilePage />
      </>} />
      {/* Auth Layout */}
      <Route element={<AuthLayout />}>
        {/* Login Card */}
        <Route path="login" element={<>
          <SEO title="Login" description="Log in to your Muse account" path="/login" />
          <LoginCard />
        </>} />
        {/* Register Card */}
        <Route path="register" element={<>
          <SEO title="Register" description="Create your Muse account" path="/register" />
          <RegisterCard />
        </>} />
      </Route>
      {/* Dashboard Layout */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* Dashboard Home */}
        <Route index element={<>
          <SEO title="Dashboard" description="Your personal music dashboard - manage and discover music" path="/dashboard" />
          <DashboardHome />
        </>} />
        {/* Favorites Routes */}
        <>
          <Route path="favorites" element={<>
            <SEO title="Favorites" description="Your favorite tracks and playlists" path="/dashboard/favorites" />
            <FavoritesView />
          </>} />
          <Route path="help" element={<>
            <SEO title="Help" description="Get help and support for using Muse" path="/dashboard/help" />
            <HelpPage />
          </>} />
          <Route path="songs" element={<>
            <SEO title="Songs" description="Browse and manage your music collection" path="/dashboard/songs" />
            <SongsPage />
          </>} />
        </>
        {/* Profile Routes */}
        <>
          <Route path="profile" element={<>
            <SEO title="My Profile" description="Manage your Muse profile and settings" path="/dashboard/profile" />
            <ProfilePage />
          </>} />
        </>
        {/* Playlists Routes */}
        <>
          <Route path="playlists" element={<>
            <SEO title="My Playlists" description="Manage your music playlists" path="/dashboard/playlists" />
            <PlaylistsPage />
          </>} />
          <Route path="playlists/:id" element={<>
            <SEO title="Playlist" description="View and edit your playlist" />
            <SinglePlaylistPage />
          </>} />
        </>
        {/* Settings Routes */}
        <Route path="settings" element={<>
          <SEO title="Settings" description="Customize your Muse experience" path="/dashboard/settings" />
          <SettingsPage />
        </>} />
        {/* Songs Routes */}
        <>
          <Route path="songs/youtube" element={<>
            <SEO title="YouTube Music" description="Browse and import your YouTube music" path="/dashboard/songs/youtube" />
            <YouTubeSongsView />
          </>} />
          <Route path="songs/soundcloud" element={<>
            <SEO title="SoundCloud" description="Browse and import your SoundCloud music" path="/dashboard/songs/soundcloud" />
            <SoundCloudSongsView />
          </>} />
        </>
        {/* Not Found Route */}
        <Route path="*" element={<>
          <SEO title="Not Found" description="The page you're looking for doesn't exist" />
          <NotFoundPage />
        </>} />
      </Route>
      {/* Not Found Route */}
      <Route path="*" element={<>
        <SEO title="Not Found" description="The page you're looking for doesn't exist" />
        <NotFoundPage />
      </>} />
    </Routes>
  );
}
