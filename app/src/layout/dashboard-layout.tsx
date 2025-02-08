import { MiniPlayer } from "@/components/mini-player";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { useStore } from "@/hooks/use-store";
import { useUser } from '@/hooks/use-user';
import { type BreadcrumbSegment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLayoutEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { toast } from 'sonner';
import { MuseSidebar } from "./components/muse-sidebar";

function formatBreadcrumbLabel(segment: string): string {
    if (!segment) return "Dashboard";
    if (segment.toLowerCase() === "dashboard") return "Dashboard";
    const withoutDashes = segment.replace(/[-_]/g, " ");
    return withoutDashes
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function generateBreadcrumbs(pathname: string): BreadcrumbSegment[] {
    const paths = pathname.replace(/\/$/, "").split("/").filter(Boolean);
    if (paths[0] !== "dashboard" && pathname !== "/") paths.unshift("dashboard");
    return paths.map((segment, index) => {
        const path = `/${paths.slice(0, index + 1).join("/")}`;
        return {
            label: formatBreadcrumbLabel(segment),
            path,
            isLast: index === paths.length - 1
        };
    });
}

export function DashboardLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { data: user } = useUser();
    const sidebar = useStore(useSidebarToggle, (state) => state);
    const breadcrumbs = useMemo(
        () => generateBreadcrumbs(location.pathname),
        [location.pathname]
    );

    useLayoutEffect(() => {
        const token = localStorage.getItem("token");
        if (!token && !["/login", "/register"].includes(location.pathname)) {
            toast.error("You must be logged in to access this page");
            navigate("/login");
        }
    }, [navigate]);

    return (
        <>
            <SidebarProvider>
                <MiniPlayer />
                <MuseSidebar />
                <main className={cn(sidebar?.isOpen === false ? "lg:ml-[90px]" : "lg:ml-72", "flex-1 overflow-auto transition-all pb-16")}>
                    {/* TODO: Maybe remove the bottom padding? */}
                    <Outlet />
                </main>
            </SidebarProvider>
        </>
    );
}