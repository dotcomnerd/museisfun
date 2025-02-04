import { BUCKET_NAME, getPresignedUrl } from "@/lib/cloudflare";
import { authMiddleware } from "@/lib/middleware";
import Playlist from "@/models/playlist";
import Song from "@/models/song";
import { Request, Response, Router } from "express";
import User from "../models/user";
import mongoose, { mongo } from 'mongoose';

const router = Router();

const internetConnection: boolean = false;

const getUsers = (req: Request, res: Response) => {
    User.find()
        .select("-password")
        .populate("songs")
        .then((users) => {
            res.json(users);
        })
        .catch((error) => {
            res.status(500).json({ message: "Internal server error", error });
        });
};

// TODO: Send less info back to the client
const getUser = async (req: Request, res: Response) => {
    const { username } = req.params

    if (!username) {
        return res.status(400).json({ message: "Invalid input" });
    }

    try {
        const maybeUser = await User
            .findOne
            ({ username })
            .select("-password")
            .populate("songs");

        if (!maybeUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json(maybeUser);
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

    if (!user || !song) throw new Error("Entities not found.")

    if (user.favoriteSongs.includes(songId)) {
        user.favoriteSongs = user.favoriteSongs.filter((id) => id.toHexString() !== songId.toHexString());
        await user.save()
        return "removed";
    }

    user.favoriteSongs.push(songId);
    await user.save()
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
router.get("/:username", authMiddleware, getUser);
router.delete("/:id", authMiddleware, deleteUser);
router.get("/data/stats", authMiddleware, userStatistics);
router.post("/media/favorite/:type", authMiddleware, addNewFavorite)
router.get("/media/favorite/:type", authMiddleware, getFavorites)

export default router;
