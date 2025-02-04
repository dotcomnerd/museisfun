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
    UserStatisticsResponse
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
import { Song } from './features/songs/dashboard/view'
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
import { useAudioStore } from './stores/audioStore'

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

    const { data: museStats } = useQuery({
        queryKey: ["muse-stats"],
        queryFn: async () => {
            const { data } = await Fetcher.getInstance().get("/users/data/stats");
            return data as UserStatisticsResponse;
        },
    });

    const { data: mostPlayedPlaylists, isLoading: mostPlayedPlaylistsLoading, isError: mostPlayedPlaylistsError } = useQuery({
        queryKey: ["most-played-playlists"],
        queryFn: async () => {
            const { data } = await Fetcher.getInstance().get(`/api/playlists/${user?.data?._id}/most-played`);
            return data as GetMostPlayedPlaylistsResponse;
        },
    });

    const { data: recentlyDownloaded, isLoading: recentlyDownloadedLoading, isError: recentlyDownloadedError } = useQuery({
        queryKey: ["recently-downloaded"],
        queryFn: async () => {
            const { data } = await Fetcher.getInstance().get("/api/songs/downloads/recent");
            return data as GetRecentDownloadsResponse;
        }
    });

    const { data: favoriteTracks, isLoading: favoriteTracksLoading, isError: favoriteTracksError } = useQuery({
        queryKey: ["favorite-tracks"],
        queryFn: async () => {
            const { data } = await Fetcher.getInstance().get("/users/media/favorite/song");
            return data as Song[];
        }
    });

    console.log(favoriteTracks);

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
            const playlist = mostPlayedPlaylists?.find((playlist) => playlist._id === playlistId) as Playlist;
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

    if (!sidebar) return null;
    return (
        <>
            <div className="flex flex-col min-h-screen bg-background">
                <header className="sticky top-0 z-10 h-14 md:h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                    <div className="container px-4 py-6 space-y-8">
                        <div className="space-y-2">
                            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
                                {getMessage()}, {user?.data?.username}
                            </h1>
                            <p className="text-muted-foreground">Welcome back to your music dashboard</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                                <Card key={idx} className="bg-secondary/50 hover:bg-secondary/70 transition-colors duration-200">
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
                                                <p className="text-2xl md:text-3xl font-bold">
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
                            ))}
                        </div>
                        <Card className="bg-secondary/50">
                            <CardHeader className="space-y-1">
                                <CardTitle>Recent Downloads</CardTitle>
                                <CardDescription>Your latest tracks</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentlyDownloadedError ? (
                                    <div className="text-red-500 text-center py-4">Error loading recent downloads</div>
                                ) : recentlyDownloadedLoading ? (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {recentlyDownloaded?.map((track, index) => (
                                            <div key={index} className="flex items-center gap-3 group">
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                                    <img
                                                        src={track.thumbnail}
                                                        alt={track.title}
                                                        className="object-cover w-full h-full"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Button
                                                            variant="link"
                                                            size="icon"
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => initializeAudio([...recentlyDownloaded], index)}
                                                        >
                                                            <Play className="h-4 w-4 text-white" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{track.title}</p>
                                                    <p className="text-sm text-muted-foreground truncate">{track.uploader}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="bg-secondary/50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2">
                                        <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                                        Favorites
                                    </CardTitle>
                                    <CardDescription>Your most loved tracks</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/favorites")}>
                                    View All
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {favoriteTracksError ? (
                                    <div className="text-red-500 text-center py-4">Error loading favorite tracks</div>
                                ) : favoriteTracksLoading ? (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {favoriteTracks?.map((track, index) => (
                                            <div
                                                key={index}
                                                className="group relative flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                                    <img
                                                        src={track.thumbnail}
                                                        alt={track.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <Button
                                                        size="icon"
                                                        variant="link"
                                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => initializeAudio([...favoriteTracks], index)}
                                                    >
                                                        <Play className="h-4 w-4 text-white" />
                                                    </Button>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{track.title}</p>
                                                    <p className="text-sm text-muted-foreground truncate">{track.uploader}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Heart className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="bg-secondary/50">
                            <CardHeader>
                                <CardTitle>Popular Playlists</CardTitle>
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
                                        {mostPlayedPlaylists?.map((playlist, index) => (
                                            <div key={index} className="flex items-center gap-3 group">
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
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div >
        </>
    )
}
