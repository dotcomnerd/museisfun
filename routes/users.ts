import { BUCKET_NAME, getPresignedUrl } from "@/lib/cloudflare";
import { authMiddleware, optionalAuthMiddleware } from "@/lib/middleware";
import Playlist from "@/models/playlist";
import Song from "@/models/song";
import { Request, Response, Router } from "express";
import mongoose from 'mongoose';
import User from "../models/user";

const router = Router();

const internetConnection: boolean = false;
const usersCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

const getUsers = async (req: Request, res: Response) => {
    try {
        const now = Date.now();
        for (const [key, value] of usersCache.entries()) {
            if (now - value.timestamp > CACHE_DURATION) {
                usersCache.delete(key);
            }
        }

        const cacheKey = 'all_users';
        const cached = usersCache.get(cacheKey);
        if (cached && now - cached.timestamp < CACHE_DURATION) {
            return res.json(cached.users);
        }

        const users = await User.find()
            .select("-password")
            .populate("songs");

        usersCache.set(cacheKey, {
            users,
            timestamp: now
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};

// TODO: Send less info back to the client
const getUser = async (req: Request, res: Response) => {
    const { username } = req.params;

    if (!username) {
        return res.status(400).json({ message: "Invalid input" });
    }

    try {
        const now = Date.now();

        for (const [key, value] of usersCache.entries()) {
            if (now - value.timestamp > CACHE_DURATION) {
                usersCache.delete(key);
            }
        }

        const cacheKey = `user_${username}`;
        const cached = usersCache.get(cacheKey);
        if (cached && now - cached.timestamp < CACHE_DURATION) {
            return res.json(cached.user);
        }

        const maybeUser = await User
            .findOne({ username })
            .select("-password -__v");

        console.log(maybeUser);
        if (!maybeUser) return res.status(404).json({ message: "User not found" });

        // Check if the user is authenticated
        const isAuthenticated = req.auth !== undefined;

        const songs = await Song.find({ createdBy: maybeUser._id })
            .limit(10)
            .select("title duration thumbnail uploader listeningTime createdAt updatedAt");

        // Get the user's public playlists
        const playlists = await Playlist.find({
            createdBy: maybeUser._id,
            visibility: "public"
        })
        .limit(10)
        .select("title songs thumbnail createdAt updatedAt");

        // Create the response object, selecting appropriate fields based on authentication
        let userResponse;
        if (isAuthenticated) {
            // Authenticated users get full profile
            userResponse = {
                ...maybeUser.toObject(),
                songs: songs.map(song => ({
                    ...song.toObject(),
                    _id: song._id.toString(),
                })),
                playlists: playlists.map(playlist => ({
                    ...playlist.toObject(),
                    _id: playlist._id.toString(),
                })),
            };
        } else {
            // Unauthenticated users only get public information
            userResponse = {
                _id: maybeUser._id,
                username: maybeUser.username,
                name: maybeUser.name,
                pfp: maybeUser.pfp,
                bio: maybeUser.bio,
                songs: songs.map(song => ({
                    ...song.toObject(),
                    _id: song._id.toString(),
                })),
                playlists: playlists.map(playlist => ({
                    ...playlist.toObject(),
                    _id: playlist._id.toString(),
                })),
                createdAt: maybeUser.createdAt,
                updatedAt: maybeUser.updatedAt,
            };
        }

        usersCache.set(cacheKey, { user: userResponse, timestamp: now });
        res.json(userResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

const deleteUser = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Invalid input" });
    }

    try {
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({ message: "User deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};

async function getTotalNumberOfDownloads(userId: string) {
    return await Song.countDocuments({ createdBy: userId });
}

async function storageUsedByDownloads(userId: string) {
    const songs = await Song.find({ createdBy: userId });
    if (!songs) return 0;

    const contentUrls = await Promise.all(songs.map((song) => getPresignedUrl({
        key: song?.r2Key || "",
        bucket: BUCKET_NAME,
        expiresIn: 60,
    })));

    const sizes = await Promise.all(contentUrls?.map(async (url) => {
        const res = await fetch(url);
        const size = res.headers.get("content-length");
        return size ? parseInt(size, 10) : 0;
    }));

    return sizes.reduce((acc, size) => acc + size, 0);
}

async function getTotalNumberOfPllaylists(userId: string) {
    return await Playlist.countDocuments({ createdBy: userId });
}

async function getTotalListeningTime(userId: string) {
    const songs = await Song.find({ createdBy: userId });
    return songs.reduce((acc, song) => acc + (song.listeningTime || 0), 0);
}

const userStatistics = async (req: Request, res: Response) => {
    const userId = req.auth?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const [totalDownloads, storageUsed, totalPlaylists, totalListeningTime] = await Promise.all([
        getTotalNumberOfDownloads(userId),
        storageUsedByDownloads(userId),
        getTotalNumberOfPllaylists(userId),
        getTotalListeningTime(userId),
    ]);

    const storageUsedMB = Number(storageUsed) / (1024 * 1024);
    const totalListeningTimeHours = totalListeningTime / 3600;

    res.json({
        totalDownloads,
        storageUsed: storageUsedMB.toFixed(2),
        totalPlaylists,
        totalListeningTime: totalListeningTimeHours.toFixed(2),
    });
};

type FavoriteType = { type: "playlist" | "song" };

async function markPlaylistAsFavorite(playlistId: string, userId: string) {
    try {
        const playlist = await Playlist.findById(playlistId);
        const user = await User.findById(userId);

        if (!user || !playlist) throw new Error("Entities not found.")

        user.favoritePlaylists.push(playlist.id);
        await user.save()

    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message)
        }
    }
}

type FavoriteState = "added" | "removed" | "failed";

async function markSongAsFavorite(songId: mongoose.Types.ObjectId, userId: string): Promise<FavoriteState> {
    const song = await Song.findById(songId);
    const user = await User.findById(userId);

    if (!user || !song) throw new Error("Entities not found.");

    // Check if the song is already favorited
    if (user.favoriteSongs.includes(songId)) {
        user.favoriteSongs = user.favoriteSongs.filter((id) => id.toHexString() !== songId.toHexString());
        await user.save();
        return "removed";
    }

    // If the user is not the creator of the song, create a copy
    if (song?.createdBy?.toString() !== userId) {
        const songCopy = new Song({
            ...song.toObject(),
            _id: new mongoose.Types.ObjectId(),
            createdBy: userId,
            originalSongId: song._id,
            isCopy: true
        });
        await songCopy.save();
        user.favoriteSongs.push(songCopy._id);
    } else {
        user.favoriteSongs.push(songId);
    }

    await user.save();
    return "added";
}

const addNewFavorite = async (req: Request, res: Response) => {
    const userId = req.auth?._id;
    const { type } = req.params as unknown as FavoriteType;
    const itemId = req.body.itemId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const itemIdString = mongoose.Types.ObjectId.createFromHexString(itemId)
    switch (type) {
        case "playlist":
            // TODO: Implement playlist favorite
            // await markPlaylistAsFavorite(itemIdString, userId)
            // return res.status(200).json({ message: "Playlist favorited successfully!" })
        case "song":
            const favoriteState = await markSongAsFavorite(itemIdString, userId);
            if (favoriteState !== "failed") {
                return res.status(200).json({ favoriteState });
            }
            return res.status(500).json({ error: "Failed to favorite song." })
        default:
            return res.status(400).json({ error: "Bad Request, include a type." })
    }
}

const getFavorites = async (req: Request, res: Response) => {
    const userId = req.auth?._id;
    const { type } = req.params as unknown as FavoriteType;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    switch (type) {
        case "playlist":
            return res.json(await User.findById(userId).populate("favoritePlaylists"));
        case "song":
            const usersFavoriteSongs = await User.findById(userId).populate("favoriteSongs");
            const songs = await Song.find({ _id: { $in: usersFavoriteSongs?.favoriteSongs } });
            return res.json(songs);
        default:
            return res.status(400).json({ error: "Bad Request, include a type." })
    }
}


router.get("/", authMiddleware, getUsers);
router.get("/:username", optionalAuthMiddleware, getUser);
router.delete("/:id", authMiddleware, deleteUser);
router.get("/data/stats", authMiddleware, userStatistics);
router.post("/media/favorite/:type", authMiddleware, addNewFavorite)
router.get("/media/favorite/:type", authMiddleware, getFavorites)

export default router;
