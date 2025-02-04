import { BUCKET_NAME, getPresignedUrl, R2 } from "@/lib/cloudflare";
import Song from "@/models/song";
import User from '@/models/user';
import { convertToObjectId, UrlValidator } from "@/util/urlValidator";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { spawn } from "child_process";
import crypto from "crypto";
import { Router } from "express";
import fs from "fs";
import mongoose from 'mongoose';
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

const router = Router();
const __dirname = path.resolve();

async function downloadSong(url: string): Promise<DownloadResult> {
    const metadata = await new Promise<SongMetadata>((resolve, reject) => {
        let jsonData = "";
        const ytDlpInfo = spawn("yt-dlp", ["--dump-json", url]);

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

router.post("/api/songs", async (req, res) => {
    try {
        const {
            mediaUrl: url,
        } = req.body;
        const user = req.auth;
        const validator = new UrlValidator();

        if (!validator.validate(url)) throw new Error("Invalid URL");
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

router.get("/api/songs/:id/stream", async (req, res) => {
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

// Update song endpoint
router.patch("/api/songs/:id", async (req, res) => {
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

// Get all songs endpoint
router.get("/api/songs", async (req, res) => {
    if (!req.auth) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const songs = await Song.find({ createdBy: req.auth._id });
        const favoriteSongs = await User.findById(req.auth._id).select("favoriteSongs");
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
        res.json(songsWithFavorites);
    } catch (error) {
        console.error("Error fetching songs:", error);
        res.status(500).json({ error: error });
    }
});

// Delete song endpoint
router.delete("/api/songs/:id", async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);

        if (!song) {
            return res.status(404).json({ error: "Song not found" });
        }

        if (!song.r2Key) {
            return res.status(404).json({ error: "Song not found" });
        }

        // Delete from R2
        await R2.send(
            new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: song.r2Key,
            })
        );

        // Delete metadata
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

router.get("/api/songs/:type", async (req, res) => {
    try {
        const { type } = req.params;

        if (!extractors.includes(type)) {
            return res.status(400).json({ error: `Invalid extractor type: ${type}` });
        }

        const songs = await Song.find({ extractor: type, createdBy: req.auth?._id });

        for (const song of songs) {
            if (song.r2Key && !song.stream_url) {
                song.stream_url = await getPresignedUrl({ key: song.r2Key, bucket: BUCKET_NAME, expiresIn: 60 * 60 * 24 });
            } else if (!song.r2Key) {
                // Remove songs that don't have a key
                await Song.deleteOne({ _id: song._id });
            }
        }

        res.json(songs);

    } catch (error) {
        console.error("Error fetching songs:", error);
        res.status(500).json({ error: error });
    }
});

router.get("/api/songs/downloads/recent", async (req, res) => {
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

router.post("/api/songs/:id/listen", async (req, res) => {
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

router.get("/api/songs/top/listened", async (req, res) => {
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

export default router;