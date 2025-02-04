import Fetcher from "@/lib/fetcher";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export type User = {
    _id: string;
    email: string;
    name: string;
    username: string;
    pfp?: string;
};

export const useUser = (): UseQueryResult<User, Error> => {
    const navigate = useNavigate();
    return useQuery({
        queryKey: ["use-user"],
        queryFn: async (): Promise<User | Error> => {
            // If the user is not within the app, don't fetch the user
            try {
                const response = await Fetcher.getInstance().get<User>("/auth/user");
                return response.data;
            } catch (err) {
                if (err instanceof AxiosError && err.response?.status === 401) {
                    navigate("/login");
                    toast.error("Your session has expired. Please log in again.");
                    localStorage.removeItem("token");
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
            // Don't retry on 401 errors
            if (error instanceof AxiosError && error.response?.status === 401) {
                return false;
            }
            // Retry other errors up to 3 times
            return failureCount < 3;
        },
    });
};
