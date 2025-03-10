import axios, { AxiosInstance, AxiosResponse } from "axios";
import { toast } from 'sonner';
import { create } from 'zustand';

export const DEV_BASE_URL = import.meta.env.VITE_DEV_BASE_URL;
export const PROD_BASE_URL = import.meta.env.VITE_PROD_BASE_URL;
export const BASE_URL = import.meta.env.DEV
    ? DEV_BASE_URL
    : PROD_BASE_URL;

type LoadingPhase = 'initial' | 'connecting' | 'processing' | 'finalizing' | 'completed' | 'error';
interface LoadingState {
    // Track overall progress from 0-1
    progress: number;
    // Track active requests
    activeRequests: Record<string, boolean>;
    // Track current loading phase
    phase: LoadingPhase;
    // Track dashboard stats loading specifically
    dashboardLoading: boolean;

    // Actions
    startLoading: (requestId?: string) => void;
    updateProgress: (value: number, phase: LoadingPhase) => void;
    setDashboardLoading: (isLoading: boolean) => void;
    finishLoading: (requestId?: string) => void;
    resetLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
    progress: 0,
    activeRequests: {},
    phase: 'initial',
    dashboardLoading: true,

    startLoading: (requestId = 'global') => set(state => {
        // Add to active requests
        const activeRequests = { ...state.activeRequests, [requestId]: true };
        return {
            progress: 0.05,
            phase: 'connecting',
            activeRequests,
            dashboardLoading: true
        };
    }),

    updateProgress: (value, phase) => set({
        progress: value > 1 ? 1 : value < 0 ? 0 : value,
        phase
    }),

    setDashboardLoading: (isLoading) => set({ dashboardLoading: isLoading }),

    finishLoading: (requestId = 'global') => set(state => {
        // Remove from active requests
        const activeRequests = { ...state.activeRequests };
        delete activeRequests[requestId];

        // If no more active requests, set progress to 1
        const isComplete = Object.keys(activeRequests).length === 0;

        return {
            progress: isComplete ? 1 : state.progress,
            phase: isComplete ? 'completed' : state.phase,
            activeRequests
        };
    }),

    resetLoading: () => set({
        progress: 0,
        phase: 'initial',
        activeRequests: {},
        dashboardLoading: true
    }),
}));

// Function to simulate realistic loading for stats data
export function simulateStatsLoading(requestId = 'stats') {
    const { startLoading, updateProgress, finishLoading } = useLoadingStore.getState();
    startLoading(requestId);
    setTimeout(() => {
        updateProgress(0.3, 'connecting');
        setTimeout(() => {
            updateProgress(0.90, 'finalizing');
        }, 1800);
    }, 500);
    return () => finishLoading(requestId);
}

class Fetcher {
    private static instance: AxiosInstance;

    private constructor() { }

    public static getInstance(): AxiosInstance {
        if (!Fetcher.instance) {
            Fetcher.instance = axios.create({
                baseURL: BASE_URL,
            });

            Fetcher.instance.interceptors.request.use(
                (config) => {
                    const token = localStorage.getItem("token");
                    if (token && config.headers) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }

                    // Start loading indicator for dashboard stats
                    if (config.method?.toLowerCase() === 'get' &&
                        config.url &&
                        (config.url.includes('/users/data/stats') ||
                         config.url.includes('/stats'))) {

                        // Generate a unique request ID
                        const requestId = `${config.method}-${config.url}-${Date.now()}`;

                        // Attach request ID to config for later retrieval
                        config.headers['X-Request-ID'] = requestId;

                        // Start simulated loading
                        simulateStatsLoading(requestId);
                    }

                    return config;
                },
                (error) => {
                    console.error("Request error:", error);
                    return Promise.reject(error);
                }
            );

            Fetcher.instance.interceptors.response.use(
                (response: AxiosResponse) => {
                    // Handle successful response
                    if (response.config.url &&
                        (response.config.url.includes('/users/data/stats') ||
                         response.config.url.includes('/stats'))) {

                        // Get request ID
                        const requestId = response.config.headers?.['X-Request-ID'] as string;

                        // Set dashboard loading to false with a small delay for a smooth transition
                        setTimeout(() => {
                            const { finishLoading, setDashboardLoading } = useLoadingStore.getState();
                            // Finish loading for this request
                            finishLoading(requestId);
                            // Mark dashboard as loaded after a small delay
                            setTimeout(() => {
                                setDashboardLoading(false);
                            }, 600);
                        }, 500);
                    }
                    return response;
                },
                (error) => {
                    console.error("Response error:", error);
                    if (error.response?.status === 401) {
                        localStorage.removeItem("token");
                        window.location.href = "/login";
                    } else if (error.response?.status === 413) {
                        toast.error("File is too large");
                    }

                    // Handle errors for stats requests
                    if (error.config?.url &&
                        (error.config.url.includes('/users/data/stats') ||
                         error.config.url.includes('/stats'))) {

                        // Get request ID
                        const requestId = error.config.headers?.['X-Request-ID'] as string;

                        // Update loading state to error
                        const { updateProgress, finishLoading, setDashboardLoading } = useLoadingStore.getState();
                        updateProgress(1, 'error');

                        // Finish loading for this request
                        setTimeout(() => {
                            finishLoading(requestId);
                            // Mark dashboard as loaded even with error
                            setDashboardLoading(false);
                        }, 1000);
                    }

                    return Promise.reject(error);
                }
            );
        }

        return Fetcher.instance;
    }
}

export default Fetcher;
