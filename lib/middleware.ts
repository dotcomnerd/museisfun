import { generateToken, verifyToken } from "@/lib/jwt";
import User from "@/models/user";
import Playlist from "@/models/playlist";
import { NextFunction, Request, Response } from "express";

type JWTDecoded = {
    _id: string;
    email: string;
    name: string;
    username: string;
    pfp?: string;
};

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (req.url === "/health" || req.originalUrl === "/api/songs/demo/random") {
        next();
        return;
    }

    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Authorization token missing or invalid." });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyToken(token) as JWTDecoded;
        req.token = token;
        req.auth = {
            _id: decoded._id,
            email: decoded.email,
            name: decoded.name,
            username: decoded.username,
            pfp: decoded.pfp,
        };
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token." });
    }
};

export const optionalAuthMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        next();
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyToken(token) as JWTDecoded;
        req.token = token;
        req.auth = {
            _id: decoded._id,
            email: decoded.email,
            name: decoded.name,
            username: decoded.username,
            pfp: decoded.pfp,
        };
        next();
    } catch (error) {
        next();
    }
};

export const playlistAuthMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { idOrSlug } = req.params;

    try {
        let playlist;
        if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
            playlist = await Playlist.findById(idOrSlug);
        }

        if (!playlist) {
            const decodedSlug = decodeURIComponent(idOrSlug);
            playlist = await Playlist.findOne({ name: decodedSlug });
        }

        if (!playlist) {
            res.status(404).json({ error: "Playlist not found" });
            return;
        }

        if (playlist.visibility === "public") {
            await optionalAuthMiddleware(req, res, next);
            return;
        }

        await authMiddleware(req, res, next);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to process request" });
    }
};

export const songFromPlaylistMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { playlistId } = req.query;

    try {
        if (!playlistId) {
            await authMiddleware(req, res, next);
            return;
        }

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            await authMiddleware(req, res, next);
            return;
        }

        if (playlist.visibility === "public") {
            await optionalAuthMiddleware(req, res, next);
            return;
        }

        await authMiddleware(req, res, next);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to process request" });
    }
};

export const refreshTokenMiddleware = async (
    req: Request,
    res: Response
): Promise<string | undefined> => {
    const token = req.token;
    try {
        const decoded = verifyToken(token) as JWTDecoded;
        const user = await User.findById(decoded._id);

        const newToken = generateToken({
            _id: decoded._id,
            email: user?.email,
            name: user?.name,
            username: user?.username,
            pfp: user?.pfp,
        });

        return newToken;
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token." });
    }
};
