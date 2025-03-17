import { MiniPlayer } from "@/components/mini-player";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { useStore } from "@/hooks/use-store";
import { useUser } from '@/hooks/use-user';
import { cn } from "@/lib/utils";
import { createContext, useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { toast } from 'sonner';
import { MuseSidebar } from "./components/muse-sidebar";
import { useQuery } from "@tanstack/react-query";
import Fetcher, { useLoadingStore } from "@/lib/fetcher";
import { UserStatisticsResponse } from "muse-shared";
import { motion } from "framer-motion";

interface StatsContextType {
  museStats: UserStatisticsResponse | undefined;
  isLoading: boolean;
  isError: boolean;
}
/**
 * Context for the stats.
 *
 * @returns {StatsContextType} The stats context
 */
const StatsContext = createContext<StatsContextType | undefined>(undefined);

/**
 * Hook to access the stats context.
 *
 * @returns {StatsContextType} The stats context
 */
export const useStats = (): StatsContextType => {
  const context = useContext(StatsContext);
  if (context === undefined) {
    return { museStats: undefined, isLoading: false, isError: false };
  }
  return context;
};

/**
 * The layout for the dashboard.
 * It displays the sidebar, the mini player, and the main content.
 * It also displays a splash screen while the user is loading.
 *
 * @returns {JSX.Element} The DashboardLayout component
 */
export function DashboardLayout(): JSX.Element {
    const location = useLocation();
    const { data: user, isLoading: isUserLoading } = useUser();
    const sidebar = useStore(useSidebarToggle, (state) => state);
    const { dashboardLoading } = useLoadingStore();
    const isHomePage = location.pathname === "/dashboard" ||
                       location.pathname === "/dashboard/" ||
                       location.pathname === "/";
    const {
      data: museStats,
      isLoading: statsLoading,
      isError: statsError
    } = useQuery<UserStatisticsResponse>({
      queryKey: ["muse-stats"],
      queryFn: async () => {
        const { data } = await Fetcher.getInstance().get<UserStatisticsResponse>("/users/data/stats");
        return data;
      },
      enabled: isHomePage && !!user?._id,
      staleTime: 5 * 60 * 1000,
    });

    const shouldShowSplash = isUserLoading || (isHomePage && dashboardLoading);

    if (!isUserLoading && !user && !location.pathname.includes("/login") ) {
        toast.error("You must be logged in to access this page");
        return <Navigate to="/login" />;
    }

    const statsContextValue = {
      museStats,
      isLoading: isHomePage ? statsLoading : false,
      isError: isHomePage ? statsError : false
    };

    return (
        <div className="bg-background w-full overflow-auto">
            {shouldShowSplash ? (
                <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center bg-background">
                    <motion.div
                        className="flex flex-col items-center gap-8"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div
                            className="relative w-24 h-24"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                            <motion.svg className="w-full h-full" viewBox="0 0 100 100">
                                <motion.circle
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    fill="transparent"
                                    r="40"
                                    cx="50"
                                    cy="50"
                                    className="text-primary"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                                />
                                <motion.circle
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    fill="transparent"
                                    r="30"
                                    cx="50"
                                    cy="50"
                                    className="text-purple-400"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatType: "reverse",
                                        ease: "easeInOut",
                                        delay: 0.5
                                    }}
                                />
                            </motion.svg>
                        </motion.div>
                        <motion.div
                            className="w-64 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-4"
                            initial={{ width: 0 }}
                            animate={{ width: "16rem" }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        >
                            <motion.div
                                className="h-full bg-primary origin-left rounded-full"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: [0, 1, 0.5, 1] }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    times: [0, 0.4, 0.7, 1],
                                    ease: "easeInOut"
                                }}
                                style={{ width: '100%' }}
                            />
                        </motion.div>
                        <motion.p
                            className="text-lg font-medium text-primary mt-2"
                            initial={{ opacity: 1 }}
                            animate={{ opacity: [1, 0.7, 1] }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            Loading Muse...
                        </motion.p>
                        <motion.div
                            className="absolute"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0, 0.7, 0],
                                scale: [0.5, 1.5, 0.5]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <div className="w-40 h-40 rounded-full bg-primary/10 blur-xl" />
                        </motion.div>
                    </motion.div>
                </div>
            ) : (
                <StatsContext.Provider value={statsContextValue}>
                    <div className="h-full w-full">
                        <SidebarProvider>
                            <MiniPlayer />
                            <MuseSidebar />
                            <main className={cn(
                                sidebar?.isOpen === false ? "lg:ml-[90px]" : "lg:ml-72",
                                "flex-1 transition-all pb-16 h-full overflow-auto"
                            )}>
                                <div className="h-full overflow-auto">
                                    <div className="min-h-screen w-full">
                                        <Outlet />
                                    </div>
                                </div>
                            </main>
                        </SidebarProvider>
                    </div>
                </StatsContext.Provider>
            )}
        </div>
    );
}
