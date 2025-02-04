// import { useTheme } from "@/components/theme-provider";
import { useTheme } from "@/components/theme-provider";
import { Breadcrumb, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { MuseSidebar } from "./components/app-sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Menu, Plus, X, ListMusic, Music, Home, Heart, Settings } from 'lucide-react';
import { AddSongDialog } from '@/features/songs/add-song-dialog';
import { Input } from '@/components/ui/input';
import { useAudioStore } from '@/stores/audioStore';
import { Drawer, DrawerClose, DrawerTitle, DrawerHeader, DrawerContent } from '@/components/ui/drawer';

export function DashboardLayout() {
    const { theme } = useTheme();
    const resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    const resolvedTheme = theme || resolved;
    const BG_URL =
        resolvedTheme === "light"
            ? `https://4kwallpapers.com/images/walls/thumbs_3t/10781.png`
            : `https://4kwallpapers.com/images/walls/thumbs_3t/19801.jpg`;
    return (
        <>
            <div
                className={`min-h-screen bg-cover bg-center bg-fixed bg-no-repeat bg-blend-darken text-white`}
                style={{
                    backgroundImage:
                        resolvedTheme === "light"
                            ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${BG_URL}')`
                            : `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${BG_URL}')`,
                }}
            >
                <SidebarProvider>
                    <MuseSidebar />
                    <SidebarInset>
                        <Outlet />
                    </SidebarInset>
                </SidebarProvider>
            </div>
        </>
    );
}
export function DashboardPageLayout({
    children,
    breadcrumbs,
}: {
    children: ReactNode;
    breadcrumbs: ReactNode;
}) {
    const { theme } = useTheme();
    const sidebar = useStore(useSidebarToggle, (state) => state);
    const { searchTerm, setSearchTerm } = useAudioStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

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

    if (!sidebar) return null;
    const resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const resolvedTheme = theme || resolved;
    const BG_URL = resolvedTheme === "light"
        ? `https://4kwallpapers.com/images/walls/thumbs_3t/10781.png`
        : `https://4kwallpapers.com/images/walls/thumbs_3t/19801.jpg`;

    return (
        <div
            className={cn(
                "flex flex-col h-full bg-cover bg-center bg-fixed bg-no-repeat border border-primary rounded"
            )}
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, ${resolvedTheme === "light" ? "0.3" : "0.7"}), rgba(0, 0, 0, ${resolvedTheme === "light" ? "0.3" : "0.7"})), url('${BG_URL}')`
            }}
        >
            {/* Mobile Navigation Menu */}
            <Drawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <DrawerContent className="bg-black/90 backdrop-blur-sm">
                    <DrawerHeader>
                        <DrawerTitle className="text-xl font-bold text-primary">Menu</DrawerTitle>
                        <DrawerClose asChild>
                            <Button variant="ghost" size="icon">
                                <X className="h-6 w-6" />
                            </Button>
                        </DrawerClose>
                    </DrawerHeader>
                    <div className="flex flex-col space-y-4 p-4">
                        <div className="flex flex-col space-y-4">
                            <div onClick={() => navigate('/dashboard')} className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-md cursor-pointer">
                                <Home className="w-5 h-5" />
                                <span>Home</span>
                            </div>
                            <div onClick={() => navigate('/dashboard/songs')} className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-md cursor-pointer">
                                <Music className="w-5 h-5" />
                                <span>Songs</span>
                            </div>
                            <div onClick={() => navigate('/dashboard/playlists')} className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-md cursor-pointer">
                                <ListMusic className="w-5 h-5" />
                                <span>Playlists</span>
                            </div>
                            <div onClick={() => navigate('/dashboard/profile')} className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-md cursor-pointer">
                                <Heart className="w-5 h-5" />
                                <span>Profile</span>
                            </div>
                            <div onClick={() => navigate('/dashboard/settings')} className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-md cursor-pointer">
                                <Settings className="w-5 h-5" />
                                <span>Settings</span>
                            </div>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between px-4 h-16 border-b border-purple-900/30">
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                    <Menu className="h-6 w-6" />
                </Button>
                <Input
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mx-2 flex-1 bg-purple-900/20 border-purple-900/30 text-white placeholder:text-purple-300/50 focus:border-purple-500"
                />
                <AddSongDialog>
                    <Button variant="ghost" size="icon">
                        <Plus className="h-6 w-6" />
                    </Button>
                </AddSongDialog>
            </header>

            {/* Desktop Header */}
            <header className="hidden md:flex h-16 items-center px-4">
                <div className="flex items-center gap-2 w-full">
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:text-primary"
                                onClick={() => sidebar?.setIsOpen()}
                            >
                                ⌘ U
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Toggle Sidebar
                        </TooltipContent>
                    </Tooltip>
                    <Separator orientation="vertical" className="h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>{breadcrumbs}</BreadcrumbList>
                    </Breadcrumb>
                    <div className="flex items-center ml-auto space-x-4">
                        <Input
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64 bg-purple-900/20 border-purple-900/30 text-white placeholder:text-purple-300/50 focus:border-purple-500"
                        />
                        <AddSongDialog>
                            <Button className="bg-primary hover:bg-primary/80">
                                <Plus className="mr-2 h-4 w-4" /> Add Song
                            </Button>
                        </AddSongDialog>
                    </div>
                </div>
            </header>

            <Separator />
            <main className="flex-1 overflow-auto p-4">
                {children}
            </main>
        </div>
    );
}
