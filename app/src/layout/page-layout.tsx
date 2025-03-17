import { useTheme } from "@/components/theme-provider";
import { Breadcrumb, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { useStore } from "@/hooks/use-store";
import { useUser } from '@/hooks/use-user';
import { cn } from "@/lib/utils";
import { Heart, Home, ListMusic, Menu, Music, Settings, X } from 'lucide-react';
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from 'sonner';

export function PageLayout({
    children,
    breadcrumbs,
}: {
    children: ReactNode;
    breadcrumbs: ReactNode;
}) {
    const { theme } = useTheme();
    const sidebar = useStore(useSidebarToggle, (state) => state);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { data: currentUser } = useUser();

    useEffect(() => {
        if (!currentUser) {
            toast.error("You must be logged in to access this page");
            navigate("/login");
        }
    }, [navigate, currentUser]);

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
                "flex flex-col min-h-screen h-full bg-cover bg-center bg-fixed bg-no-repeat"
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
            </header>

            {/* Desktop Header */}
            <header className="hidden md:flex h-16 items-center px-4">
                <div className="flex items-center gap-2 w-full">
                    <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="plain"
                                size="icon"
                                className="h-7 w-7 hover:text-primary p-2"
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
                </div>
            </header>

            <Separator />
            <main className="flex-1 overflow-auto p-4">
                {children}
            </main>
        </div>
    );
}
