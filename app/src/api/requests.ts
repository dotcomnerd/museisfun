import Fetcher from '@/lib/fetcher';
import { Song } from '@/lib/types';

const api = Fetcher.getInstance();

export const getSongs = async () => {
    const res = await api.get<Song[]>("/api/songs");
    return res.data;
};

export const deleteSong = async (id: string) => {
    await api.delete(`/api/songs/${id}`);
};