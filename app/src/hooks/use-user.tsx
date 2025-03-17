import Fetcher from "@/lib/fetcher";
import { useUserStore } from '@/stores/userStore';
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from 'zod';

/**
 * User schema definition representing the authenticated user data
 * returned from the API
 */
export const userSchema = z.object({
    _id: z.string(),
    email: z.string().email(),
    name: z.string(),
    username: z.string(),
    pfp: z.string().optional() // Profile picture URL (optional)
});

export type User = z.infer<typeof userSchema>;

/**
 * Custom hook to fetch and manage the current authenticated user
 *
 * @returns UseQueryResult containing user data or error
 */
export const useUser = (): UseQueryResult<User, Error> => {
    const navigate = useNavigate();
    return useQuery({
        queryKey: ["use-user"],
        queryFn: async (): Promise<User | Error> => {
            try {
                const response = await Fetcher.getInstance().get<User>("/auth/user");
                useUserStore.getState().user = response.data;
                useUserStore.getState().token = localStorage.getItem("token") || null;
                const validatedUser = userSchema.parse(response.data);
                return validatedUser;
            } catch (err) {
                if (err instanceof AxiosError && err.response?.status === 401) {
                    useUserStore.getState().clearUser();
                    localStorage.removeItem("token");
                    navigate("/login");
                    toast.error("Your session has expired. Please log in again.");
                } else {
                    if (err instanceof AxiosError) {
                        toast.error(err.message)
                    }
                }
                return new Error("Something went wrong when fetching the user.")
            }
        },
        enabled: !!localStorage.getItem("token"),
        retry: (failureCount, error) => {
            if (error instanceof AxiosError && error.response?.status === 401) {
                return false;
            }
            return failureCount < 2;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchInterval: false,
        refetchIntervalInBackground: false,
    });
};
