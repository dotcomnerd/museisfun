import { GetRecentDownloadsResponse } from 'muse-shared';
import { z } from 'zod';
export type SortKey = 'title' | 'duration' | 'uploader' | 'upload_date';
export type FavoriteState = "added" | "removed" | "failed";
export type TrackType = GetRecentDownloadsResponse[number];
interface ExtendedTrack extends TrackType {
    isFavorited?: boolean;
}
export type RecentlyDownloaded = {
    title: string;
    thumbnail: string;
    stream_url: string;
    uploader: string;
    _id: string;
}
export interface Song extends ExtendedTrack {
    _id: string;
    title: string;
    duration: number;
    mediaUrl: string;
    r2Key: string;
    createdBy: string;
    upload_date: string;
    view_count: number;
    thumbnail: string;
    isFavorited?: boolean;
    tags: string[];
    stream_url: string;
    original_url: string;
    extractor: string;
    duration_string: string;
    ytdlp_id: string;
    uploader: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Playlist {
    _id: string;
    name: string;
    description?: string;
    coverImage?: string;
    visibility: "public" | "private" | "friends";
    createdBy: {
        _id: string;
        username: string;
    };
    songs: Song[];
    createdAt: string;
    updatedAt: string;
    playCount: number;
}

export type BreadcrumbSegment = {
    label: string;
    path: string;
    isLast: boolean;
};

export type HelpItem = {
  q: string;
  a: string;
};

export interface HelpSection {
  title: string;
  items: {
    q: string;
    a: string | React.ReactNode;
  }[];
}

export type LegalDocument = {
  name: string;
  icon: React.ElementType;
  content: string;
};

export interface UserWithId {
  _id: string;
  username: string;
  email: string;
  name: string;
  bio: string;
  pfp: string;
  songs: Song[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PutProfileResponse {
  updatedUser: UserWithId;
  newToken: string;
}

export const updateUserSchema = z
    .object({
        username: z.string().min(3).max(20).optional(),
        email: z.string().email().optional(),
        name: z.string().optional(),
        bio: z.string().optional(),
        password: z.string().optional(),
        pfp: z.instanceof(FileList).optional(),
    })
    .refine(
        (data) => {
            if (data.username !== undefined && data.username.length === 0)
                return false;
            if (data.email !== undefined && data.email.length === 0) return false;
            return true;
        },
        {
            message: "Required fields cannot be empty if provided",
        }
    );

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const addSongSchema = z.object({
  url: z
    .string()
    .url("Please enter a valid URL")
    .refine(
      (url) =>
        url.includes("youtube.com") ||
        url.includes("youtu.be") ||
        url.includes("soundcloud.com") ||
        url.includes("music.apple.com") ||
        url.includes("spotify.com") ||
        url.includes("last.fm/music"),
      "URL must be from YouTube, SoundCloud, Apple Music, Spotify, or Last.fm"
    ),
});

export type AddSongInput = z.infer<typeof addSongSchema>;
