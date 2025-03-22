import { BUCKET_NAME, COVERS_BUCKET_NAME, deleteFromR2, extractKeyFromProxyUrl, getPresignedUrl, getProxyUrl, TEST_BUCKET_NAME, uploadToR2 } from "@/lib/cloudflare";
import { authMiddleware, optionalAuthMiddleware } from "@/lib/middleware";
import Playlist, { PlaylistModel } from "@/models/playlist";
import { SongModel } from "@/models/song";
import { UserModel } from "@/models/user";
import { convertToObjectId } from "@/util/urlValidator";
import crypto from "crypto";
import { Request, Response, Router } from "express";
import multer from "multer";

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.mimetype)) {
            cb(new Error("Invalid file type"));
            return;
        }
        cb(null, true);
    },
});

// Protected routes - require auth
router.post(
    "/playlists",
    authMiddleware,
    upload.single("coverImage"),
    async (req: Request, res: Response) => {
        try {
            const { name, description, visibility } = req.body;
            const user = req.auth;
            let coverUrl = null;

            if (!user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (req.file) {
                const fileExtension = req.file.originalname.split(".").pop();
                // Simple key format with UUID and extension
                const key = `images/${crypto.randomUUID()}.${fileExtension}`;

                // Use TEST_BUCKET_NAME in development, COVERS_BUCKET_NAME in production
                const bucketName = process.env.NODE_ENV === "production" ? COVERS_BUCKET_NAME : TEST_BUCKET_NAME;

                try {
                    // Use the new uploadToR2 function that handles local development
                    const result = await uploadToR2({
                        file: req.file.buffer,
                        key,
                        bucket: bucketName,
                        contentType: req.file.mimetype
                    });

                    if (!result.success) {
                        throw new Error("Failed to upload cover image");
                    }

                    coverUrl = await getProxyUrl({
                        key,
                        bucket: "covers"
                    });
                } catch (error) {
                    console.error("Failed to upload cover image:", error);
                    return res.status(500).json({ error: "Failed to upload cover image" });
                }
            }

            const newPlaylist = new Playlist({
                name,
                description,
                createdBy: user._id,
                visibility,
                coverImage: coverUrl,
                songs: [],
            });

            await newPlaylist.save();
            res.status(201).json(newPlaylist);
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: "Failed to create playlist" });
        }
    }
);

// Optional auth routes - auth if available but not required
router.get(
    "/playlists",
    optionalAuthMiddleware,
    async (req: Request, res: Response) => {
        try {
            let query;
            if (req.auth) {
                // If authenticated, show user's playlists and public playlists
                query = {
                    $or: [
                        { createdBy: req.auth._id },
                        { visibility: "public" }
                    ],
                };
            } else {
                // If not authenticated, only show public playlists
                query = { visibility: "public" };
            }

            const playlists = await Playlist.find(query)
                .populate("createdBy")
                .populate({
                    path: "songs",
                    select: "title r2Key stream_url duration uploader thumbnail duration_string"
                }) as unknown as (PlaylistModel & { songs: SongModel[] })[];

            for (const playlist of playlists) {
                for (const song of playlist.songs) {
                    if (song.r2Key && !song.stream_url) {
                        song.stream_url = await getPresignedUrl({
                            key: song.r2Key,
                            bucket: BUCKET_NAME,
                            expiresIn: 60 * 60 * 24
                        });
                    }

                    // Handle song thumbnails
                    if (song.thumbnail && song.thumbnail.includes(BUCKET_NAME)) {
                        const thumbnailKey = song.thumbnail.split('/').pop()?.split('?')[0];
                        if (thumbnailKey) {
                            song.thumbnail = await getPresignedUrl({
                                key: thumbnailKey,
                                bucket: BUCKET_NAME,
                                expiresIn: 60 * 60 * 24
                            });
                        }
                    }
                }
            }

            res.json(playlists);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to fetch playlists" });
        }
    }
);

router.get(
    "/playlists/:idOrSlug",
    optionalAuthMiddleware,
    async (req: Request, res: Response) => {
        try {
            const { idOrSlug } = req.params;
            let playlist;

            if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
                playlist = await Playlist.findById(idOrSlug);
            }

            if (!playlist) {
                const decodedSlug = decodeURIComponent(idOrSlug);
                playlist = await Playlist.findOne({ name: decodedSlug });
            }

            if (!playlist) return res.status(404).json({ error: "Playlist not found" });

            playlist = await playlist.populate<{ createdBy: UserModel }>({
                path: 'createdBy',
                select: 'username _id pfp',
            });
            playlist = await playlist.populate<{ songs: SongModel[] }>('songs');

            if (playlist.visibility !== "public") {
                if (!req.auth) {
                    return res.status(403).json({ error: "Access denied" });
                }
                const isCreator = req.auth._id.toString() === playlist.createdBy._id.toString();
                if (!isCreator) {
                    return res.status(403).json({ error: "Access denied" });
                }
            }

            for (const song of playlist.songs) {
                if (song.r2Key && !song.stream_url) {
                    song.stream_url = await getPresignedUrl({
                        key: song.r2Key,
                        bucket: BUCKET_NAME,
                        expiresIn: 60 * 60 * 24
                    });
                }

                // Handle song thumbnails
                if (song.thumbnail && song.thumbnail.includes(BUCKET_NAME)) {
                    const thumbnailKey = song.thumbnail.split('/').pop()?.split('?')[0];
                    if (thumbnailKey) {
                        song.thumbnail = await getPresignedUrl({
                            key: thumbnailKey,
                            bucket: BUCKET_NAME,
                            expiresIn: 60 * 60 * 24
                        });
                    }
                }
            }
            return res.json(playlist);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to fetch playlist" });
        }
    }
);

// Protected routes - require auth
router.put(
    "/playlists/:id",
    authMiddleware,
    upload.single("cover"),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const user = req.auth;
            if (!user) return res.status(401).json({ error: "Unauthorized" });

            console.log("Update playlist request body:", {
                id,
                name: req.body.name,
                description: req.body.description,
                visibility: req.body.visibility,
                isPublic: req.body.isPublic
            });

            const playlist = await Playlist.findById(id);
            if (!playlist) {
                return res.status(404).json({ error: "Playlist not found" });
            }

            if (playlist.createdBy._id.toString() !== user._id.toString() && playlist.visibility === "private") {
                return res.status(403).json({ error: "Access denied" });
            }

            const updates: Partial<PlaylistModel> = {};
            if (req.body.name) updates.name = req.body.name;
            if (req.body.description) updates.description = req.body.description;

            // Fix visibility update logic to use the direct visibility field
            if (req.body.visibility) {
                updates.visibility = req.body.visibility;
            } else if (req.body.isPublic !== undefined) {
                // Keep backward compatibility with isPublic for any older code
                updates.visibility = req.body.isPublic ? "public" : "private";
            }

            if (req.file) {
                // Delete the old cover image if it exists
                if (playlist.coverImage) {
                    try {
                        // Extract the key from the URL
                        const key = extractKeyFromProxyUrl(playlist.coverImage);

                        if (key) {
                            // Use our new deleteFromR2 function to delete from the appropriate bucket
                            const bucketName = process.env.NODE_ENV === "production" ? COVERS_BUCKET_NAME : TEST_BUCKET_NAME;
                            await deleteFromR2({
                                key,
                                bucket: bucketName
                            });
                        }
                    } catch (error) {
                        console.error("Failed to delete old cover image:", error);
                        // Continue with upload even if delete fails
                    }
                }

                // Upload the new cover image with simple path
                const fileExtension = req.file.originalname.split(".").pop();
                const key = `images/${crypto.randomUUID()}.${fileExtension}`;

                try {
                    // Use TEST_BUCKET_NAME in development, COVERS_BUCKET_NAME in production
                    const bucketName = process.env.NODE_ENV === "production" ? COVERS_BUCKET_NAME : TEST_BUCKET_NAME;

                    // Use the new uploadToR2 function that handles local development
                    const result = await uploadToR2({
                        file: req.file.buffer,
                        key,
                        bucket: bucketName,
                        contentType: req.file.mimetype
                    });

                    if (!result.success) {
                        throw new Error("Failed to upload cover image");
                    }

                    updates.coverImage = await getProxyUrl({
                        key,
                        bucket: "covers"
                    });
                } catch (error) {
                    console.error("Failed to upload new cover image:", error);
                    return res.status(500).json({ error: "Failed to upload cover image" });
                }
            }

            const updatedPlaylist = await Playlist.findByIdAndUpdate
                (id, updates, { new: true })
                .populate("createdBy")
                .populate("songs");

            console.log({
                updatedPlaylist
            });

            return res.json(updatedPlaylist);
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: "Failed to update playlist" });
        }
    }
);

router.post(
    "/playlists/:id/songs",
    authMiddleware,
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { songId } = req.body;
            const user = req.auth;

            if (!user) return res.status(401).json({ error: "Unauthorized" });

            const playlist = await Playlist.findById(id);
            if (!playlist) {
                return res.status(404).json({ error: "Playlist not found" });
            }

            if (playlist.createdBy._id.toString() !== user._id.toString()) {
                return res.status(403).json({ error: "Access denied" });
            }

            if (!playlist.songs.includes(songId)) {
                playlist.songs.push(songId);
                await playlist.save();
            }

            const updatedPlaylist = await Playlist.findById(id)
                .populate("createdBy")
                .populate("songs");
            res.json(updatedPlaylist);
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: "Failed to add song to playlist" });
        }
    }
);

router.delete(
    "/playlists/:id/songs/:songId",
    authMiddleware,
    async (req: Request, res: Response) => {
        try {
            const { id, songId } = req.params;
            const user = req.auth;

            if (!user) return res.status(401).json({ error: "Unauthorized" });

            const playlist = await Playlist.findById(id);
            if (!playlist) {
                return res.status(404).json({ error: "Playlist not found" });
            }

            if (playlist.createdBy._id.toString() !== user._id.toString()) {
                return res.status(403).json({ error: "Access denied" });
            }

            playlist.songs = playlist.songs.filter(
                (song) => song.toString() !== songId
            );
            await playlist.save();

            const updatedPlaylist = await Playlist.findById(id)
                .populate("createdBy")
                .populate("songs");
            res.json(updatedPlaylist);
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: "Failed to remove song from playlist" });
        }
    }
);

router.delete(
    "/playlists/:id",
    authMiddleware,
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const user = req.auth;

            if (!user) return res.status(401).json({ error: "Unauthorized" });

            const playlist = await Playlist.findById(id);
            if (!playlist) {
                return res.status(404).json({ error: "Playlist not found" });
            }

            if (playlist.createdBy._id.toString() !== user._id.toString()) {
                return res.status(403).json({ error: "Access denied" });
            }

            // Delete the cover image if it exists
            if (playlist.coverImage) {
                try {
                    // Extract the key from the URL
                    const key = extractKeyFromProxyUrl(playlist.coverImage);

                    if (key) {
                        // Use our new deleteFromR2 function to delete from the appropriate bucket
                        const bucketName = process.env.NODE_ENV === "production" ? COVERS_BUCKET_NAME : TEST_BUCKET_NAME;
                        await deleteFromR2({
                            key,
                            bucket: bucketName
                        });
                        console.log(`Successfully deleted cover image: ${key}`);
                    }
                } catch (error) {
                    console.error("Failed to delete cover image:", error);
                    // Continue with playlist deletion even if image delete fails
                }
            }

            await Playlist.findByIdAndDelete(id);
            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to delete playlist" });
        }
    }
);

router.get("/playlists/:userId/most-played", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.auth?._id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const parsedUserId = convertToObjectId(userId);
        const playlists = await Playlist
            .find({ createdBy: parsedUserId })
            .where("playCount").gt(0)
            .sort({ playCount: -1 })
            .limit(5)
            .populate<{ songs: SongModel[] }>("songs");

        for (const playlist of playlists) {
            for (const song of playlist.songs) {
                if (song) {
                    if (song.r2Key && !song.stream_url) {
                        song.stream_url = await getPresignedUrl({
                            key: song.r2Key,
                            bucket: BUCKET_NAME,
                            expiresIn: 60 * 60 * 24
                        });
                    }

                    // Handle song thumbnails
                    if (song.thumbnail && song.thumbnail.includes(BUCKET_NAME)) {
                        const thumbnailKey = song.thumbnail.split('/').pop()?.split('?')[0];
                        if (thumbnailKey) {
                            song.thumbnail = await getPresignedUrl({
                                key: thumbnailKey,
                                bucket: BUCKET_NAME,
                                expiresIn: 60 * 60 * 24
                            });
                        }
                    }
                }
            }
        }

        res.json(playlists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch most played playlists" });
    }
});

router.post("/playlists/:id/play", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const playlist = await Playlist.findById(id);
        if (!playlist) return res.status(404).json({ error: "Playlist not found" });
        playlist.playCount += 1;
        await playlist.save();
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update playlist play count" });
    }
});

export default router;
