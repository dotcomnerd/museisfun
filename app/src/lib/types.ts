import { GetRecentDownloadsResponse } from 'muse-shared';

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