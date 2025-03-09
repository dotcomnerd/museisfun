import { UserProfile } from '@/features/profile/nested';
import Fetcher from '@/lib/fetcher';
import { AddSongInput, PutProfileResponse, Song, UpdateUserInput, UserWithId } from '@/lib/types';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

export const handleError = (err: unknown) => {
    if (err instanceof AxiosError) {
        toast.error(err.response?.data?.error || "Failed to fetch user details");
        if (err.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        } else {
            toast.error("An unexpected error occurred");
        }
    }
    throw err;
};

const api = Fetcher.getInstance();

export const getSongs = async () => {
    const res = await api.get<Song[]>("/api/songs");
    return res.data;
};

export const deleteSong = async (id: string) => {
    await api.delete(`/api/songs/${id}`);
};

export const addSong = async (data: AddSongInput) => {
    const response = await api.post("/api/songs", {
        mediaUrl: data.url,
    });
    return response.data;
};

export const getUserProfile = async (username: string) => {
    // TODO: Handle 404 / nonexistent user
    const res = await api.get<UserProfile>(`/users/${username}`);
    return res.data;
};

export const getUserDetails = async () => {
    const { data } = await api.get<UserWithId>("/auth/details");
    return data;
};

export const getUserWithId = async () => {
    try {
        const user = await getUserDetails();
        return user;
    } catch (err) {
        return handleError(err);
    }
};

export const updateUser = async (data: UpdateUserInput) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (key === "pfp" && value instanceof FileList && value.length > 0) {
                formData.append("pfp", value[0]);
            } else if (key !== "pfp") {
                formData.append(key, value as string);
            }
        }
    });

    try {
        const { data: responseData } = await api.put<PutProfileResponse>(
            "/auth/update",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        localStorage.setItem("token", responseData.newToken);

        return { data: responseData.updatedUser };
    } catch (err) {
        if (err instanceof AxiosError) {
            throw new Error(err.response?.data?.error || "Update failed");
        }
        throw err;
    }
};
