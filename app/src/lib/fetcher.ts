import axios, { AxiosInstance, AxiosResponse } from "axios";
import { toast } from 'sonner';
import { create } from 'zustand';

export const DEV_BASE_URL = import.meta.env.VITE_DEV_BASE_URL;
export const PROD_BASE_URL = import.meta.env.VITE_PROD_BASE_URL;
export const BASE_URL = import.meta.env.DEV
    ? DEV_BASE_URL
    : PROD_BASE_URL;

interface LoadingState {
    dashboardLoading: boolean;
    setDashboardLoading: (isLoading: boolean) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
    dashboardLoading: true,
    setDashboardLoading: (isLoading) => set({ dashboardLoading: isLoading }),
}));

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
                    return config;
                },
                (error) => {
                    console.error("Request error:", error);
                    return Promise.reject(error);
                }
            );

            Fetcher.instance.interceptors.response.use(
                (response: AxiosResponse) => {
                    if (response.config.url && response.config.url.includes('/users/data/stats')) {
                        useLoadingStore.getState().setDashboardLoading(false);
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

                    if (error.config?.url && error.config.url.includes('/users/data/stats')) {
                        useLoadingStore.getState().setDashboardLoading(false);
                    }

                    return Promise.reject(error);
                }
            );
        }

        return Fetcher.instance;
    }
}

export default Fetcher;
