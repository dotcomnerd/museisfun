import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Clock, Download, HardDrive, Heart, ListMusic, Loader2, Play } from 'lucide-react'
import {
    GetMostPlayedPlaylistsResponse,
    GetRecentDownloadsResponse,
    UserStatisticsResponse,
} from "muse-shared"
import { Link, Route, Routes, useNavigate, useParams } from "react-router"
import { AuthLayout, LoginCard, RegisterCard } from "./components/auth"
import { HelpView } from "./features/help/view"
import { Features } from './features/landing/features'
import { Footer } from './features/landing/footer'
import { HeroSection } from "./features/landing/hero"
import { Navbar } from "./features/landing/nav"
import { PricingPage } from './features/landing/pricing'
import { Playlist, PlaylistViewNested } from "./features/playlists/nested"
import { PlaylistView } from "./features/playlists/view"
import { ProfileViewNested, UserProfile } from "./features/profile/nested"
import { ProfileView } from "./features/profile/view"
import { SettingsView } from "./features/settings/view"
import { SongsPage } from "./features/songs/dashboard/page"
import { SoundCloudSongsView } from "./features/songs/soundcloud/view"
import { YouTubeSongsView } from "./features/songs/youtube/view"
import { useSidebarToggle } from './hooks/use-sidebar-toggle'
import { useStore } from './hooks/use-store'
import { useUser } from './hooks/use-user'
import { ContentLayout } from "./layout/container"
import { DashboardPageLayout } from "./layout/page-layout"
import NotFoundPage from './layout/static/fourohfour'
import { SheetMenu } from './layout/static/muse-nav'
import Fetcher from "./lib/fetcher"
import { useAudioStore, usePlayerControls } from './stores/audioStore'
import { FavoritesView } from './features/favorites/view'
import { motion } from "framer-motion";
import { toast } from 'sonner'
import { Song } from './features/songs/dashboard/view'

type TrackType = GetRecentDownloadsResponse[number];
interface ExtendedTrack extends TrackType {
    isFavorited?: boolean;
}

export default function App() {
    return (
        <div>
            <Navbar />
            <HeroSection />
            <Features />
            <PricingPage />
            <Footer />
        </div>
    );
}

function About() {
    return <h1>About</h1>;
}

function PlaylistsPage() {
    return (
        <>
            <DashboardPageLayout
                breadcrumbs={
                    <>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to="/dashboard">Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Playlists</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                }
            >
                <div className="mb-4 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold dark:text-gray-200 text-gray-700">
                        Your Playlists
                    </h1>
                </div>
                <PlaylistView />
            </DashboardPageLayout>
        </>
    );
}

function ProfilePage() {
    return (
        <>
            <DashboardPageLayout
                breadcrumbs={
                    <>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to="/dashboard">Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Profile</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                }
            >
                <ProfileView />
            </DashboardPageLayout>
        </>
    );
}

function SinglePlaylistPage() {
    const { id } = useParams<{ id: string }>();
    const api = Fetcher.getInstance();
    const { data: playlist } = useQuery({
        queryKey: ["playlist", id],
        queryFn: async () => {
            const { data } = await api.get<Playlist>(`/api/playlists/${id}`);
            return data;
        },
    });
    return (
        <>
            <DashboardPageLayout
                breadcrumbs={
                    <>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to="/dashboard">Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to="/dashboard/playlists">Playlists</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{playlist?.name ?? "Playlist"}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                }
            >
                <PlaylistViewNested />
            </DashboardPageLayout>
        </>
    );
}

function ProfilePageForUser() {
    const api = Fetcher.getInstance();
    const { username } = useParams<{ username: string }>();
    const { data: user, isLoading } = useQuery({
        queryKey: ["user-profile", username],
        queryFn: async () => {
            const { data } = await api.get<UserProfile>(`/users/${username}`);
            return data;
        },
    });
    return (
        <>
            <DashboardPageLayout
                breadcrumbs={
                    <>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to="/dashboard">Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to="/dashboard/profile">Profile</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>
                                {isLoading ? "Loading..." : `${user?.username}`}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                }
            >
                <ProfileViewNested userData={user} isLoading={isLoading} />
            </DashboardPageLayout>
        </>
    );
}

function HelpPage() {
    return (
        <>
            <DashboardPageLayout
                breadcrumbs={
                    <>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to="/dashboard">Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Help</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                }
            >
                <HelpView />
            </DashboardPageLayout>
        </>
    );
}

function SettingsPage() {
    return (
        <>
            <DashboardPageLayout
                breadcrumbs={
                    <>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to="/dashboard">Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Settings</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                }
            >
                <SettingsView />
            </DashboardPageLayout>
        </>
    );
}


export function MuseRouting() {
    return (
        <Routes>
            <Route index element={<App />} />
            <Route path="about" element={<About />} />
            <Route element={<AuthLayout />}>
                <Route path="login" element={<LoginCard />} />
                <Route path="register" element={<RegisterCard />} />
            </Route>
            <Route path="/dashboard" element={<ContentLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="favorites" element={<FavoritesView />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="songs" element={<SongsPage />} />
                <>
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="profile/:username" element={<ProfilePageForUser />} />
                </>
                <>
                    <Route path="playlists" element={<PlaylistsPage />} />
                    <Route path="playlists/:id" element={<SinglePlaylistPage />} />
                </>
                <Route path="settings" element={<SettingsPage />} />
                <Route path="songs/youtube" element={<YouTubeSongsView />} />
                <Route path="songs/soundcloud" element={<SoundCloudSongsView />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export type RecentlyDownloaded = {
    title: string;
    thumbnail: string;
    stream_url: string;
    uploader: string;
    _id: string;
}


function DashboardHome() {
    const navigate = useNavigate();
    const sidebar = useStore(useSidebarToggle, (state) => state);
    const user = useUser();
    const queryClient = useQueryClient();
    const { initializeAudio } = useAudioStore()
    const { playSong } = usePlayerControls()

    const { data: museStats } = useQuery<UserStatisticsResponse>({
        queryKey: ["muse-stats"],
        queryFn: async () => {
            const { data } = await Fetcher.getInstance().get<UserStatisticsResponse>("/users/data/stats");
            return data;
        },
    });

    const { data: mostPlayedPlaylists, isLoading: mostPlayedPlaylistsLoading, isError: mostPlayedPlaylistsError } = useQuery<GetMostPlayedPlaylistsResponse>({
        queryKey: ["most-played-playlists"],
        queryFn: async () => {
            const { data } = await Fetcher.getInstance().get<GetMostPlayedPlaylistsResponse>(`/api/playlists/${user?.data?._id}/most-played`);
            return data;
        },
    })

    const { data: recentlyDownloaded, isLoading: recentlyDownloadedLoading, isError: recentlyDownloadedError } = useQuery<GetRecentDownloadsResponse>({
        queryKey: ["recently-downloaded"],
        queryFn: async () => {
            const { data } = await Fetcher.getInstance().get<GetRecentDownloadsResponse>("/api/songs/downloads/recent");
            return data;
        }
    });

    const { data: favoriteTracks, isLoading: favoriteTracksLoading, isError: favoriteTracksError } = useQuery<ExtendedTrack[]>({
        queryKey: ["favorite-tracks"],
        queryFn: async () => {
            const { data } = await Fetcher.getInstance().get<ExtendedTrack[]>("/users/media/favorite/song");
            return data;
        }
    });

    const getMessage = () => {
        const date = new Date();
        const hours = date.getHours();
        if (hours < 12) return "Good Morning";
        if (hours < 18) return "Good Afternoon";
        if (hours < 21) return "Good Evening";
        return "Good Night";
    }

    const mutation = useMutation({
        mutationFn: async (playlistId: string) => {
            const playlist = mostPlayedPlaylists?.find((playlist: any) => playlist._id === playlistId) as Playlist;
            if (playlist) {
                await initializeAudio(playlist.songs, 0, playlist);
            } else {
                throw new Error("Playlist not found");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["most-played-playlists"] });
        },
        onError: (error) => {
            console.error("Error initializing playlist:", error);
        }
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    if (!sidebar) return null;
    return (
        <>
            <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/95">
                <header className="sticky top-0 z-10 h-14 md:h-16 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container h-full flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center -space-x-2">
                                <SheetMenu />
                                <Separator orientation="vertical" className="hidden lg:block mx-4 h-4" />
                                <SidebarTrigger className="hidden lg:flex" onClick={sidebar.setIsOpen} />
                            </div>
                            <Breadcrumb className="hidden sm:flex">
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink asChild>
                                            <Link to="/dashboard">Dashboard</Link>
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>Home</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden">
                    <motion.div
                        className="container px-4 py-6 space-y-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div
                            className="space-y-2"
                            variants={itemVariants}
                        >
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                                {getMessage()}, {user?.data?.username}
                            </h1>
                            <p className="text-muted-foreground text-lg">Here's what's happening with your music</p>
                        </motion.div>
                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-4 gap-4"
                            variants={containerVariants}
                        >
                            {[
                                {
                                    label: 'Downloads',
                                    value: museStats?.totalDownloads,
                                    icon: <Download className="w-5 h-5 text-primary" />
                                },
                                {
                                    label: '# of Playlists',
                                    value: museStats?.totalPlaylists,
                                    icon: <ListMusic className="w-5 h-5 text-primary" />
                                },
                                {
                                    label: 'Storage Used',
                                    value: `${museStats?.storageUsed} MB`,
                                    icon: <HardDrive className="w-5 h-5 text-primary" />
                                },
                                {
                                    label: 'Listening Time',
                                    value: `${museStats?.totalListeningTime}h`,
                                    icon: <Clock className="w-5 h-5 text-primary" />
                                }
                            ].map((stat, idx) => (
                                <motion.div key={idx} variants={itemVariants}>
                                    <Card className="bg-card/50 hover:bg-card/70 transition-colors duration-200 border-border/50 backdrop-blur-sm">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="rounded-lg bg-primary/10 p-2">
                                                    {stat.icon}
                                                </div>
                                                <span className="text-xs font-medium uppercase text-muted-foreground tracking-wider">
                                                    {stat.label}
                                                </span>
                                            </div>
                                            <div className="mt-3">
                                                {museStats ? (
                                                    <p className="text-2xl md:text-3xl font-bold text-foreground">
                                                        {stat.value}
                                                    </p>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        <span className="text-muted-foreground">Loading...</span>
                                                    </div>
                                                )}
                                                <div className="h-1 w-16 bg-primary/20 rounded-full mt-2" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <motion.div variants={itemVariants}>
                                <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                                    <CardHeader className="space-y-1">
                                        <CardTitle className="text-xl">Recent Downloads</CardTitle>
                                        <CardDescription>Your latest tracks</CardDescription>
                                    </CardHeader>
                                    <CardContent className="max-h-[300px] overflow-y-auto">
                                        {recentlyDownloadedError ? (
                                            <div className="text-red-500 text-center py-4">Error loading recent downloads</div>
                                        ) : recentlyDownloadedLoading ? (
                                            <div className="flex justify-center py-4">
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {recentlyDownloaded?.map((track: GetRecentDownloadsResponse[number], index: number) => (
                                                    <motion.div
                                                        key={index}
                                                        className="flex items-center gap-3 group p-2 rounded-lg hover:bg-accent/20 transition-colors cursor-pointer"
                                                        whileHover={{ scale: 1.02 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                        onClick={() => initializeAudio([...recentlyDownloaded], index)}
                                                    >
                                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                                            <img
                                                                src={track.thumbnail}
                                                                alt={track.title}
                                                                className="object-cover w-full h-full"
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Play className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
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
                                </Card>
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <div className="space-y-1">
                                            <CardTitle className="flex items-center gap-2 text-xl">
                                                <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                                                Favorites
                                            </CardTitle>
                                            <CardDescription>Your most loved tracks</CardDescription>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/favorites")}>
                                            View All
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="max-h-[300px] overflow-y-auto">
                                        {favoriteTracksError ? (
                                            <div className="text-red-500 text-center py-4">Error loading favorite tracks</div>
                                        ) : favoriteTracksLoading ? (
                                            <div className="flex justify-center py-4">
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {favoriteTracks?.map((track, index) => (
                                                    <motion.div
                                                        key={index}
                                                        className="group relative flex items-center gap-3 p-2 rounded-lg hover:bg-accent/20 transition-colors cursor-pointer"
                                                        whileHover={{ scale: 1.02 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                        onClick={() => {
                                                            const cachedSongs = queryClient.getQueryData<Song[]>(["favorite-tracks"]);
                                                            if (cachedSongs) {
                                                                const song = cachedSongs[index];
                                                                initializeAudio([song], index);
                                                                playSong(song._id);
                                                            }

                                                        }}
                                                    >
                                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                                            <img
                                                                src={track.thumbnail}
                                                                alt={track.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Play className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium truncate">{track.title}</p>
                                                            <p className="text-sm text-muted-foreground truncate">{track.uploader}</p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const songId = track._id;
                                                                const api = Fetcher.getInstance();
                                                                api.post('/users/media/favorite/song', {
                                                                    itemId: songId
                                                                }).then(() => {
                                                                    queryClient.invalidateQueries({ queryKey: ["favorite-tracks"] });
                                                                    toast.success("Removed from favorites");
                                                                }).catch(() => {
                                                                    toast.error("Failed to remove from favorites");
                                                                });
                                                            }}
                                                        >
                                                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                                                        </Button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                        <motion.div variants={itemVariants}>
                            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-xl">Popular Playlists</CardTitle>
                                    <CardDescription>Your most played collections</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {mostPlayedPlaylistsError ? (
                                        <div className="text-red-500 text-center py-4">Error loading playlists</div>
                                    ) : mostPlayedPlaylistsLoading ? (
                                        <div className="flex justify-center py-4">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {mostPlayedPlaylists?.map((playlist: GetMostPlayedPlaylistsResponse[number], index: number) => (
                                                <motion.div
                                                    key={index}
                                                    className="flex items-center gap-3 group p-2 rounded-lg hover:bg-accent/20 transition-colors"
                                                    whileHover={{ scale: 1.02 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                >
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                                        <img
                                                            src={playlist.coverImage ?? "/default-cover.svg"}
                                                            alt={playlist.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <Button
                                                            variant="link"
                                                            size="icon"
                                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => mutation.mutate(playlist._id)}
                                                        >
                                                            <Play className="h-4 w-4 text-white" />
                                                        </Button>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{playlist.name}</p>
                                                        <p className="text-sm text-muted-foreground">{playlist.playCount} plays</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </main>
            </div>
        </>
    )
}
