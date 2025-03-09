import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
/// <reference path="../types/youtube.d.ts" />

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatDuration(seconds: number): string {
    const roundedSeconds = Math.round(seconds);
    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = roundedSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function formatDate(epoch: string): string {
    let validEpoch = "";
    for (const char of epoch) {
        if (!isNaN(parseInt(char))) {
            validEpoch += char;
        }
    }
    const date = new Date(parseInt(validEpoch) * 1000);
    const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
}

export function getYouTubePlayer(elementId: string, options: YT.PlayerOptions): YT.Player {
    const PlayerConstructor = window.YT.Player as new (elementId: string, options: YT.PlayerOptions) => YT.Player;
    return new PlayerConstructor(elementId, options);
}

/**
 * Fetches YouTube metadata using low-quota methods
 * This approach uses:
 * 1. oEmbed API (0 quota cost) for title, author
 * 2. Standard YouTube thumbnail URL pattern (0 quota)
 * 3. YouTube iframe API for duration (if player available)
 */
export async function fetchYouTubeMetadata(videoId: string) {
    try {
        // Use oEmbed endpoint (0 quota cost)
        const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const response = await fetch(oEmbedUrl);
        const data = await response.json();

        return {
            title: data.title || undefined,
            author: data.author_name || undefined,
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            publishDate: undefined,
            viewCount: undefined,
            duration: undefined
        };
    } catch (error) {
        console.error("Error fetching YouTube metadata:", error);
        return {
            title: undefined,
            author: undefined,
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            publishDate: undefined,
            viewCount: undefined,
            duration: undefined
        };
    }
}

/**
 * Extract YouTube video ID from a URL
 */
export function extractYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
}
