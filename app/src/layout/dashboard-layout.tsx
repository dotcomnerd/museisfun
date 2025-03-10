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

// Create a context to pass the stats data down to children
interface StatsContextType {
  museStats: UserStatisticsResponse | undefined;
  isLoading: boolean;
  isError: boolean;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

// Hook to easily access stats data
export const useStats = () => {
  const context = useContext(StatsContext);
  if (context === undefined) {
    return { museStats: undefined, isLoading: false, isError: false };
  }
  return context;
};

export function DashboardLayout() {
    const location = useLocation();
    const { data: user, isLoading: isUserLoading } = useUser();
    const sidebar = useStore(useSidebarToggle, (state) => state);
    const { progress, phase, dashboardLoading } = useLoadingStore();
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
      // Only fetch stats if we're on the home page and the user is logged in
      enabled: isHomePage && !!user?._id,
      staleTime: 5 * 60 * 1000, // 5 minutes
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

    const getLoadingMessage = () => {
      switch (phase) {
        case 'connecting':
          return "Connecting to Muse...";
        case 'processing':
          return "Processing your data...";
        case 'finalizing':
          return "Almost ready...";
        case 'error':
          return "Error loading data...";
        default:
          return "Preparing Muse for you...";
      }
    };

    return (
        <div className="bg-background w-full overflow-auto">
            {shouldShowSplash ? (
                <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center bg-background">
                    <div className="flex flex-col items-center gap-8">
                        <div className="relative w-24 h-24">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    fill="transparent"
                                    r="40"
                                    cx="50"
                                    cy="50"
                                    className="text-primary"
                                />
                                <circle
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
                        </div>
                        <div className="w-64 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-4">
                            <div
                                className="h-full bg-primary origin-left rounded-full transition-transform duration-300 ease-out"
                                style={{ transform: `scaleX(${progress})` }}
                            />
                        </div>
                        <p className="text-lg font-medium text-primary mt-2">{getLoadingMessage()}</p>
                    </div>
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
