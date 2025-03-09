import { MiniPlayer } from "@/components/mini-player";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { useStore } from "@/hooks/use-store";
import { useUser } from '@/hooks/use-user';
import { type BreadcrumbSegment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
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

const loadingVariants = {
    initial: { opacity: 1 },
    exit: {
        opacity: 0,
        transition: { duration: 0.7, ease: "easeInOut" }
    }
};

const contentVariants = {
    initial: {
        opacity: 0,
        clipPath: "circle(0% at center)"
    },
    animate: {
        opacity: 1,
        clipPath: "circle(150% at center)",
        transition: {
            clipPath: {
                duration: 1,
                ease: [0.22, 1, 0.36, 1]
            },
            opacity: {
                duration: 0.8
            }
        }
    }
};

const particleVariants = (index: number) => ({
    initial: {
        opacity: 0,
        y: 0,
        x: 0
    },
    animate: {
        opacity: [0, 1, 0],
        y: [-10, 10],
        x: [-10 + (index * 5), 10 + (index * 3)],
        transition: {
            duration: 2,
            repeat: Infinity,
            repeatType: "mirror" as const,
            ease: "easeInOut",
            delay: index * 0.2
        }
    }
});

export function DashboardLayout() {
    const location = useLocation();
    const { data: user, isLoading: isUserLoading } = useUser();
    const sidebar = useStore(useSidebarToggle, (state) => state);
    const breadcrumbs = useMemo(
        () => generateBreadcrumbs(location.pathname),
        [location.pathname]
    );

    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        if (!isUserLoading && user) {
            const totalLoadingTime = 2500;
            const intervalTime = 50;
            const steps = totalLoadingTime / intervalTime;
            let currentStep = 0;
            const progressInterval = setInterval(() => {
                currentStep++;
                setProgress(currentStep / steps);

                if (currentStep >= steps) {
                    clearInterval(progressInterval);
                    setIsLoading(false);
                }
            }, intervalTime);

            return () => clearInterval(progressInterval);
        }
    }, [isUserLoading, user]);

    if (import.meta.env.DEV) {
        console.log(breadcrumbs);
    }

    if (!isUserLoading && !user && !location.pathname.includes("/login")) {
        toast.error("You must be logged in to access this page");
        return <Navigate to="/login" />;
    }

    const particles = Array.from({ length: 5 }).map((_, i) => i);

    return (
        <div className="bg-background w-full h-screen overflow-hidden">
            <AnimatePresence mode="wait">
                {(isLoading || isUserLoading) ? (
                    <motion.div
                        key="loading"
                        className="flex h-full w-full items-center justify-center bg-background"
                        initial="initial"
                        exit="exit"
                        variants={loadingVariants}
                    >
                        <motion.div className="flex flex-col items-center gap-8 relative">
                            {/* Futuristic circular loader */}
                            <div className="relative w-24 h-24">
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <motion.circle
                                        initial={{ pathLength: 0 }}
                                        animate={{
                                            pathLength: 1,
                                            transition: {
                                                duration: 2,
                                                repeat: Infinity,
                                                repeatType: "loop" as const,
                                                ease: "easeInOut"
                                            }
                                        }}
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        fill="transparent"
                                        r="40"
                                        cx="50"
                                        cy="50"
                                        className="text-primary"
                                    />
                                    <motion.circle
                                        initial={{ pathLength: 0 }}
                                        animate={{
                                            pathLength: 1,
                                            transition: {
                                                duration: 2.5,
                                                repeat: Infinity,
                                                repeatType: "loop" as const,
                                                ease: "easeInOut",
                                                delay: 0.2
                                            }
                                        }}
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        fill="transparent"
                                        r="30"
                                        cx="50"
                                        cy="50"
                                        className="text-purple-400"
                                    />
                                </svg>
                                {particles.map((index) => (
                                    <motion.div
                                        key={index}
                                        className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-primary"
                                        variants={particleVariants(index)}
                                        initial="initial"
                                        animate="animate"
                                    />
                                ))}
                            </div>
                            <div className="w-64 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-4">
                                <motion.div
                                    className="h-full bg-primary origin-left rounded-full"
                                    style={{ scaleX: progress }}
                                />
                            </div>
                            <p className="text-lg font-medium text-primary mt-2">Preparing Muse for you...</p>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        variants={contentVariants}
                        initial="initial"
                        animate="animate"
                        className="h-full w-full"
                    >
                        <SidebarProvider>
                            <MiniPlayer />
                            <MuseSidebar />
                            <main className={cn(
                                sidebar?.isOpen === false ? "lg:ml-[90px]" : "lg:ml-72",
                                "flex-1 transition-all pb-16 h-full overflow-hidden"
                            )}>
                                <div className="h-full overflow-auto">
                                    <div className="min-h-screen w-full">
                                        <Outlet />
                                    </div>
                                </div>
                            </main>
                        </SidebarProvider>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
