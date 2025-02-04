import { z } from "zod";

export type MuseResponse = Response | any;

export const getUserParamsSchema = z.object({
    username: z.string().min(1, "Username is required"),
});

export const deleteUserParamsSchema = z.object({
    id: z.string().min(1, "User ID is required"),
});

export const getUsersResponseSchema = z.array(
    z.object({
        _id: z.string(),
        username: z.string(),
        email: z.string().email(),
        songs: z.array(
            z.object({
                _id: z.string(),
                title: z.string(),
                duration: z.number().optional(),
            })
        ),
    })
);

export const getUserResponseSchema = z.object({
    _id: z.string(),
    username: z.string(),
    email: z.string().email(),
    songs: z.array(
        z.object({
            _id: z.string(),
            title: z.string(),
            duration: z.number().optional(),
        })
    ),
});

export const userStatisticsResponseSchema = z.object({
    totalDownloads: z.number(),
    storageUsed: z.string(),
    totalPlaylists: z.number(),
    totalListeningTime: z.string(),
});

export const favoriteTypeSchema = z.enum(["playlist", "song"]);

export const addNewFavoriteParamsSchema = z.object({
    type: favoriteTypeSchema,
});

export const addNewFavoriteBodySchema = z.object({
    itemId: z.string().min(1, "Item ID is required"),
});

export const addNewFavoriteResponseSchema = z.object({
    message: z.string(),
});

export const getFavoritesParamsSchema = z.object({
    type: favoriteTypeSchema,
});

export const getFavoritesResponseSchema = z.array(
    z.object({
        _id: z.string(),
        title: z.string(),
        createdBy: z.string(),
    })
);

export const getUserRequestSchema = z.object({
    params: getUserParamsSchema,
});

export const deleteUserRequestSchema = z.object({
    params: deleteUserParamsSchema,
});

export const addNewFavoriteRequestSchema = z.object({
    params: addNewFavoriteParamsSchema,
    body: addNewFavoriteBodySchema,
});

export const getFavoritesRequestSchema = z.object({
    params: getFavoritesParamsSchema,
});
