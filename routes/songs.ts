import { BUCKET_NAME, getPresignedUrl, R2 } from "@/lib/cloudflare";
import { authMiddleware, optionalAuthMiddleware } from "@/lib/middleware";
import Playlist from '@/models/playlist';
import Song from "@/models/song";
import User from '@/models/user';
import { convertToObjectId, UrlValidator } from "@/util/urlValidator";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { spawn } from "child_process";
import crypto from "crypto";
import dotenv from 'dotenv';
import { Router } from "express";
import fs from "fs";
import { google } from 'googleapis';
import path from "path";

interface SongMetadata {
    title: string;
    duration: number;
    upload_date: string;
    uploader: string;
    view_count: number;
    thumbnail: string;
    tags?: string[];
    original_url?: string;
    extractor?: string;
    duration_string?: string;
    ytdlp_id?: string;
}

interface DownloadResult {
    filePath: string;
    metadata: SongMetadata;
}

// TODO: These types are dirty, come back to this at some point.
async function aggregateSongsWithFavorites(songs: any[], userId?: string) {
    if (!userId) {
        for (const song of songs) {
            song.isFavorited = false;
        }
        return songs;
    }

    const favoriteSongs = await User.findById(userId).select("favoriteSongs");
    const favoriteSongsIds = favoriteSongs?.favoriteSongs || [];

    const songsWithFavorites = songs.map(song => ({
        ...song.toObject(),
        isFavorited: favoriteSongsIds.includes(song._id)
    }));

    for (const song of songsWithFavorites) {
        if (song.r2Key && !song.stream_url) {
            song.stream_url = await getPresignedUrl({ key: song.r2Key, bucket: BUCKET_NAME, expiresIn: 60 * 60 * 24 });
        } else if (!song.r2Key) {
            // Remove songs that don't have a key
            await Song.deleteOne({ _id: song._id });
        }
    }

    return songsWithFavorites;
}

const router = Router();
const __dirname = path.resolve();
const youtube = google.youtube('v3');
dotenv.config({ path: path.join(__dirname, '../.env.local') });
const API_KEY = process.env.YOUTUBE_API_KEY;

async function downloadSong(url: string): Promise<DownloadResult> {
    const metadata = await new Promise<SongMetadata>((resolve, reject) => {
        let jsonData = "";
        const ytDlpInfo = spawn("yt-dlp", ["--dump-json", url, "--cookies", "cookies.txt"]);

            ytDlpInfo.stdout.on("data", (data) => {
                jsonData += data.toString();
            });

            ytDlpInfo.stderr.on("data", (data) => {
                console.log(`yt-dlp metadata stderr: ${data}`);
            });

        ytDlpInfo.on("close", (code) => {
            if (code === 0) {
                try {
                    const parsed = JSON.parse(jsonData);
                    console.log(parsed);
                    resolve({
                        ytdlp_id: parsed.id,
                        title: parsed.title,
                        duration: parsed.duration,
                        duration_string: parsed.duration_string,
                        upload_date: parsed.timestamp,
                        uploader: parsed.uploader,
                        view_count: parsed.view_count,
                        thumbnail: parsed.thumbnail,
                        tags: parsed.tags,
                        original_url: parsed.webpage_url,
                        extractor: parsed.extractor,
                    } satisfies SongMetadata);
                } catch (error) {
                    reject(new Error("Failed to parse metadata"));
                }
            } else {
                reject(new Error(`yt-dlp metadata process exited with code ${code}`));
            }
        });
    });

    const tempDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    const fileName = crypto.randomBytes(16).toString("hex") + ".mp3";
    const filePath = path.join(tempDir, fileName);

    await new Promise<void>((resolve, reject) => {
        const ytDlp = spawn("yt-dlp", [
            "-x",
            "-v",
            "-U",
            "--no-cache-dir",
            "--no-check-certificates",
            "--prefer-insecure",
            "--audio-format",
            "mp3",
            "--audio-quality",
            "0",
            "-o",
            filePath,
            url,
            "--cookies",
            "cookies.txt",
        ]);

        ytDlp.stderr.on("data", (data) => {
            console.log(`yt-dlp download stderr: ${data}`);
        });

        ytDlp.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`yt-dlp download process exited with code ${code}`));
            }
        });

        ytDlp.on("error", (error) => {
            ytDlp.kill();
            reject(error);
        });
    });

    return {
        filePath,
        metadata,
    };
}

type SongFormDataFields = {
    title: string;
    duration: string;
    mediaUrl: string;
    thumbnail: string;
    tags: string;
};

// Protected routes - require auth
router.post("/api/songs", authMiddleware, async (req, res) => {
    try {
        const {
            mediaUrl: url,
        } = req.body;
        const user = req.auth;
        const validator = new UrlValidator();


        if (!user) return res.status(401).json({ error: "Unauthorized" });

        const { filePath, metadata } = await downloadSong(url);

        const fileContent = fs.readFileSync(filePath as string);
        const r2Key = `songs/${crypto.randomBytes(16).toString("hex")}.mp3`;

        await R2.send(
            new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: r2Key,
                Body: fileContent,
                ContentType: "audio/mpeg",
            })
        );

        const userId = convertToObjectId(user._id);
        const existingSong = await Song.findOne({ ytdlp_id: metadata.ytdlp_id });

        if (existingSong) {
            fs.unlinkSync(filePath as string);
            return res.status(400).json({ error: "Song already exists" });
        }

        const song = new Song({
            title: metadata.title,
            artist: metadata.uploader,
            duration: metadata.duration,
            mediaUrl: url,
            r2Key,
            uploader: metadata.uploader,
            upload_date: metadata.upload_date,
            view_count: metadata.view_count,
            thumbnail: metadata.thumbnail,
            tags: metadata.tags,
            original_url: metadata.original_url,
            extractor: metadata.extractor,
            duration_string: metadata.duration_string,
            ytdlp_id: metadata.ytdlp_id,
            createdBy: userId,
        });

        await song.save();

        fs.unlinkSync(filePath as string);

        res.json({
            message: "Song uploaded successfully",
            songId: song._id,
        });
    } catch (error) {
        console.error("Error uploading song:", error);
        res.status(500).json({ error: error });
    }
});

router.get("/api/songs/:id/stream", optionalAuthMiddleware, async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({ error: "Song not found" });
        }

        if (!song.r2Key) {
            return res.status(404).json({ error: "Song not found" });
        }

        const url = await getPresignedUrl({ key: song.r2Key, bucket: BUCKET_NAME, expiresIn: 60 * 60 * 24 });

        res.json({ url });
    } catch (error) {
        console.error("Error streaming song:", error);
        res.status(500).json({ error: error });
    }
});

router.patch("/api/songs/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const song = await Song.findById(id);
        if (!song) return res.status(404).json({ error: "Song not found" });
        const allowedFields = ['title', 'duration_string', 'uploader'];
        const filteredUpdates = Object.keys(updates)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = updates[key];
                return obj;
            }, {} as Record<string, string>);

        if (Object.keys(filteredUpdates).length === 0) return res.status(400).json({ error: "No valid fields to update" });

        const updatedSong = await Song.findByIdAndUpdate(
            id,
            { $set: filteredUpdates },
            { new: true }
        );

        res.json(updatedSong);
    } catch (error) {
        console.error("Error updating song:", error);
        res.status(500).json({ error: error });
    }
});

// Public routes - no auth needed
router.get("/api/songs/playlist/:playlistId", async (req, res) => {
    try {
        const { playlistId } = req.params;
        const playlist = await Playlist.findById(playlistId).populate('songs');

        if (!playlist) {
            return res.status(404).json({ error: "Playlist not found" });
        }

        if (playlist.visibility !== "public") {
            return res.status(403).json({ error: "This playlist is not public" });
        }

        const songs = await Promise.all(playlist.songs.map(async (song: any) => {
            if (song.r2Key && !song.stream_url) {
                song.stream_url = await getPresignedUrl({
                    key: song.r2Key,
                    bucket: BUCKET_NAME,
                    expiresIn: 60 * 60 * 24
                });
            }
            return song;
        }));

        res.json(await aggregateSongsWithFavorites(songs));
    } catch (error) {
        console.error("Error fetching songs:", error);
        res.status(500).json({ error: error });
    }
});

// Optional auth routes - auth if available but not required
router.get("/api/songs", optionalAuthMiddleware, async (req, res) => {
    try {
        const playlistId = req.header("x-playlist-id");
        const isPublicPlaylist = req.header("x-playlist-public") === "true";

        if (playlistId) {
            const playlist = await Playlist.findById(playlistId).populate('songs');
            if (!playlist) {
                return res.status(404).json({ error: "Playlist not found" });
            }

            if (playlist.visibility === "public" || isPublicPlaylist) {
                const songs = await Promise.all(playlist.songs.map(async (song: any) => {
                    if (song.r2Key && !song.stream_url) {
                        song.stream_url = await getPresignedUrl({
                            key: song.r2Key,
                            bucket: BUCKET_NAME,
                            expiresIn: 60 * 60 * 24
                        });
                    }
                    return song;
                }));
                return res.json(await aggregateSongsWithFavorites(songs, req.auth?._id));
            }
        }

        if (!req.auth?._id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const songs = await Song.find({ createdBy: req.auth._id });
        const songsWithFavorites = await aggregateSongsWithFavorites(songs, req.auth._id);
        res.json(songsWithFavorites);
    } catch (error) {
        console.error("Error fetching songs:", error);
        res.status(500).json({ error: error });
    }
});

router.delete("/api/songs/:id", authMiddleware, async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);

        if (!song) {
            return res.status(404).json({ error: "Song not found" });
        }

        if (!song.r2Key) {
            return res.status(404).json({ error: "Song not found" });
        }

        await R2.send(
            new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: song.r2Key,
            })
        );

        await Song.deleteOne({ _id: req.params.id });

        res.json({ message: "Song deleted successfully" });
    } catch (error) {
        console.error("Error deleting song:", error);
        res.status(500).json({ error: error });
    }
});

export const extractors = [
    "youtube",
    "soundcloud",
]

router.get("/api/songs/:type", authMiddleware, async (req, res) => {
    try {
        const { type } = req.params;

        if (!extractors.includes(type)) {
            return res.status(400).json({ error: `Invalid extractor type: ${type}` });
        }

        if (!req.auth?._id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const songs = await Song.find({ extractor: type, createdBy: req.auth?._id });
        const songsWithFavorites = await aggregateSongsWithFavorites(songs, req.auth?._id);
        res.json(songsWithFavorites);

    } catch (error) {
        console.error("Error fetching songs:", error);
        res.status(500).json({ error: error });
    }
});

router.get("/api/songs/downloads/recent", authMiddleware, async (req, res) => {
    try {
        const songs = await Song.find({}).sort({ createdAt: -1 }).limit(5);

        for (const song of songs) {
            if (song.r2Key && !song.stream_url) {
                song.stream_url = await getPresignedUrl({ key: song.r2Key, bucket: BUCKET_NAME, expiresIn: 60 * 60 * 24 });
            } else if (!song.r2Key) {
                // Remove songs that don't have a key
                await Song.deleteOne({ _id: song._id });
            }
        }
        res.json(songs.map(({ title, uploader, thumbnail, stream_url, _id }) => ({ title, uploader, thumbnail, stream_url, _id })));
    } catch (error) {
        console.error("Error fetching songs:", error);
        res.status(500).json({ error: error });
    }
});

// MAJOR TODO: Only update the listening time for the creator of the song.
// This is a security vulnerability as it allows users to update the listening time of songs they don't own.
async function updateListeningTime(songId: string, time: number, userId: string) {
    const song = await Song.findById(songId);
    if (song) {
        if (song.createdBy?._id.toString() !== userId.toString()) {
            return; // partially handle the security vulnerability, but TODO: update client so we don't
            // have extra requests to update listening time
        }
        song.listeningTime += time;
        await song.save();
    }
}

// Protected routes - require auth
router.post("/api/songs/:id/listen", authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { time } = req.body;

    if (!req.auth?._id) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        await updateListeningTime(id, time, req.auth._id);
        res.status(200).json({ message: "Listening time updated" });
    } catch (error) {
        console.error("Error updating listening time:", error);
        res.status(500).json({ error: "Failed to update listening time" });
    }
});

router.get("/api/songs/top/listened", authMiddleware, async (req, res) => {
    try {
        const songs = await Song.find({}).sort({ listeningTime: -1 }).limit(5);

        for (const song of songs) {
            if (song.r2Key && !song.stream_url) {
                song.stream_url = await getPresignedUrl({ key: song.r2Key, bucket: BUCKET_NAME, expiresIn: 60 * 60 * 24 });
            } else if (!song.r2Key) {
                // Remove songs that don't have a key
                await Song.deleteOne({ _id: song._id });
            }
        }
        res.json(songs.map(({ title, uploader, thumbnail, stream_url, _id }) => ({ title, uploader, thumbnail, stream_url, _id })));
    } catch (error) {
        console.error("Error fetching songs:", error);
        res.status(500).json({ error: error });
    }
});

interface SimpleSongResult {
    title: string;
    thumbnail: string;
    watchUrl: string;
    channelTitle: string;
    publishedAt: string;
    viewCount: string;
    duration: string;
    likeCount: string;
    commentCount: string;
    description: string;
    channelThumbnail?: string;
}

async function getVideoDetails(id: string) {
    const response = await youtube.videos.list({
        key: API_KEY,
        part: ['contentDetails', 'snippet', 'statistics'],
        id: [id]
    });

    if (!response.data.items || response.data.items.length === 0) {
        return null;
    }

    return response.data.items[0];
}

async function getChannelThumbnail(channelId: string) {
    try {
        const response = await youtube.channels.list({
            key: API_KEY,
            part: ['snippet'],
            id: [channelId]
        });

        if (!response.data.items || response.data.items.length === 0) {
            return undefined;
        }

        return response.data.items[0].snippet?.thumbnails?.default?.url || undefined;
    } catch (error) {
        console.error('Error fetching channel thumbnail:', error);
        return undefined;
    }
}


async function searchYouTube(query: string, maxResults: number = 10) {
    try {
        const response = await youtube.search.list({
            key: API_KEY,
            part: ['snippet'],
            q: query,
            type: ['video'],
            maxResults: maxResults,
            videoEmbeddable: 'true',
        });

        if (!response.data.items) {
            return [];
        }

        return response.data.items.map(item => ({
            id: item.id?.videoId || '',
            title: item.snippet?.title || '',
            thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
            watchUrl: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
            channelId: item.snippet?.channelId || '',
            channelTitle: item.snippet?.channelTitle || '',
            publishedAt: item.snippet?.publishedAt || '',
            description: item.snippet?.description || '',
        }));
    } catch (error) {
        console.error('YouTube API Error:', error);
        throw error;
    }
}

router.get("/api/youtube/search", authMiddleware, async (req, res) => {
    try {
        const { q: query, limit } = req.query;

        if (!query || typeof query !== "string") {
            return res.status(400).json({ error: "Search query is required" });
        }

        const maxResults = limit ? parseInt(limit as string) : 10;

        if (isNaN(maxResults) || maxResults < 1 || maxResults > 50) {
            return res.status(400).json({ error: "Invalid limit value (1-50)" });
        }

        const results = await searchYouTube(query, maxResults);
        const songIds = results.map(result => result.id);

        const videoDetails = await Promise.all(songIds.map(id => getVideoDetails(id)));

        // Get channel thumbnails in parallel
        const channelIds = results.map(result => result.channelId).filter(Boolean);
        const uniqueChannelIds = [...new Set(channelIds)];
        const channelThumbnails = await Promise.all(uniqueChannelIds.map(id => getChannelThumbnail(id)));

        // Create a map of channel IDs to thumbnails
        const channelThumbnailMap = uniqueChannelIds.reduce((map, id, index) => {
            map[id] = channelThumbnails[index];
            return map;
        }, {} as Record<string, string | undefined>);

        const simplifiedResults = videoDetails
            .filter((video): video is NonNullable<typeof video> => video !== null)
            .map((video, index) => {
                const result = results[index];
                const channelId = result.channelId;
                return {
                    title: video.snippet?.title || '',
                    thumbnail: video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.default?.url || '',
                    watchUrl: `https://www.youtube.com/watch?v=${video.id}`,
                    channelTitle: video.snippet?.channelTitle || '',
                    publishedAt: video.snippet?.publishedAt || '',
                    viewCount: video.statistics?.viewCount || '0',
                    duration: formatDuration(video.contentDetails?.duration || 'PT0S'),
                    likeCount: video.statistics?.likeCount || '0',
                    commentCount: video.statistics?.commentCount || '0',
                    description: video.snippet?.description || '',
                    channelThumbnail: channelId ? channelThumbnailMap[channelId] : undefined,
                };
            }) as SimpleSongResult[];

        res.json(simplifiedResults);

    } catch (error) {
        console.error("Error searching YouTube:", error);
        res.status(500).json({
            error: "Failed to search YouTube",
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

router.get("/api/youtube/videos/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const video = await getVideoDetails(id);

        if (!video) {
            return res.status(404).json({ error: "Video not found" });
        }

        const simplifiedVideo: SimpleSongResult = {
            title: video.snippet?.title || '',
            thumbnail: video.snippet?.thumbnails?.high?.url || '',
            watchUrl: `https://www.youtube.com/watch?v=${video.id}`,
            channelTitle: video.snippet?.channelTitle || '',
            publishedAt: video.snippet?.publishedAt || '',
            viewCount: video.statistics?.viewCount || '0',
            duration: formatDuration(video.contentDetails?.duration || 'PT0S'),
            likeCount: video.statistics?.likeCount || '0',
            commentCount: video.statistics?.commentCount || '0',
            description: video.snippet?.description || '',
        };

        res.json(simplifiedVideo);

    } catch (error) {
        console.error("Error fetching video details:", error);
        res.status(500).json({
            error: "Failed to fetch video details",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

const songCache = new Map();
const CACHE_DURATION = 10 * 1000;

router.get("/api/songs/demo/random", async (req, res) => {
    try {
        const now = Date.now();
        for (const [key, value] of songCache.entries()) {
            if (now - value.timestamp > CACHE_DURATION) {
                songCache.delete(key);
            }
        }

        const cachedSongs = Array.from(songCache.values());
        if (cachedSongs.length > 0) {
            console.log("Returning cached song");
            const randomCached = cachedSongs[Math.floor(Math.random() * cachedSongs.length)];
            return res.json(randomCached.song);
        }

        const count = await Song.countDocuments();
        const random = Math.floor(Math.random() * count);
        const song = await Song.findOne().skip(random);

        if (!song) {
            return res.status(404).json({ error: "No songs found" });
        }

        if (song.r2Key) {
            song.stream_url = await getPresignedUrl({ key: song.r2Key, bucket: BUCKET_NAME, expiresIn: 60 * 60 * 24 }) || '';
        }

        const songResponse = {
            _id: song._id,
            title: song.title,
            uploader: song.uploader,
            thumbnail: song.thumbnail,
            stream_url: song.stream_url,
            duration: song.duration
        };

        songCache.set(song._id.toString(), {
            song: songResponse,
            timestamp: now
        });

        res.json(songResponse);
    } catch (error) {
        console.error("Error fetching random song:", error);
        res.status(500).json({ error: error });
    }
});

function formatDuration(isoDuration: string): string {
    // Parse ISO 8601 duration format (e.g., PT1H2M3S)
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "0:00";

    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

export default router;
