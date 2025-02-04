import { z } from "zod";

export const getUserParamsSchema = z.object({
    username: z.string().min(1, "Username is required"),
});

export type GetUserParams = z.infer<typeof getUserParamsSchema>;

export const deleteUserParamsSchema = z.object({
    id: z.string().min(1, "User ID is required"),
});

export type DeleteUserParams = z.infer<typeof deleteUserParamsSchema>;

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

export type GetUsersResponse = z.infer<typeof getUsersResponseSchema>;

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

export type GetUserResponse = z.infer<typeof getUserResponseSchema>;

export const userStatisticsResponseSchema = z.object({
    totalDownloads: z.number(),
    storageUsed: z.string(),
    totalPlaylists: z.number(),
    totalListeningTime: z.string(),
});

export type UserStatisticsResponse = z.infer<typeof userStatisticsResponseSchema>;

export const favoriteTypeSchema = z.enum(["playlist", "song"]);

export type FavoriteType = z.infer<typeof favoriteTypeSchema>;

export const addNewFavoriteParamsSchema = z.object({
    type: favoriteTypeSchema,
});

export type AddNewFavoriteParams = z.infer<typeof addNewFavoriteParamsSchema>;

export const addNewFavoriteBodySchema = z.object({
    itemId: z.string().min(1, "Item ID is required"),
});

export type AddNewFavoriteBody = z.infer<typeof addNewFavoriteBodySchema>;
export const addNewFavoriteResponseSchema = z.object({
    message: z.string(),
});

export type AddNewFavoriteResponse = z.infer<typeof addNewFavoriteResponseSchema>;

export const getFavoritesParamsSchema = z.object({
    type: favoriteTypeSchema,
});

export type GetFavoritesParams = z.infer<typeof getFavoritesParamsSchema>;

export const getFavoritesResponseSchema = z.array(
    z.object({
        _id: z.string(),
        title: z.string(),
        createdBy: z.string(),
    })
);

export type GetFavoritesResponse = z.infer<typeof getFavoritesResponseSchema>;

export const getUserRequestSchema = z.object({
    params: getUserParamsSchema,
});

export type GetUserRequest = z.infer<typeof getUserRequestSchema>;

export const deleteUserRequestSchema = z.object({
    params: deleteUserParamsSchema,
});

export type DeleteUserRequest = z.infer<typeof deleteUserRequestSchema>;

export const addNewFavoriteRequestSchema = z.object({
    params: addNewFavoriteParamsSchema,
    body: addNewFavoriteBodySchema,
});

export type AddNewFavoriteRequest = z.infer<typeof addNewFavoriteRequestSchema>;
export const getFavoritesRequestSchema = z.object({
    params: getFavoritesParamsSchema,
});

export type GetFavoritesRequest = z.infer<typeof getFavoritesRequestSchema>;
export const songMetadataSchema = z.object({
    title: z.string(),
    duration: z.number(),
    upload_date: z.string(),
    uploader: z.string(),
    view_count: z.number(),
    thumbnail: z.string(),
    tags: z.array(z.string()).optional(),
    original_url: z.string().optional(),
    extractor: z.string().optional(),
    duration_string: z.string().optional(),
    ytdlp_id: z.string().optional(),
});

export type SongMetadata = z.infer<typeof songMetadataSchema>;
export const downloadResultSchema = z.object({
    filePath: z.string(),
    metadata: songMetadataSchema,
});

export type DownloadResult = z.infer<typeof downloadResultSchema>;
export const songFormDataSchema = z.object({
    title: z.string(),
    duration: z.string(),
    mediaUrl: z.string().url(),
    thumbnail: z.string().url(),
    tags: z.string(),
});

export type SongFormDataFields = z.infer<typeof songFormDataSchema>;
export const uploadSongRequestSchema = z.object({
    body: songFormDataSchema.pick({ mediaUrl: true }),
});

export type UploadSongRequest = z.infer<typeof uploadSongRequestSchema>;
export const streamSongResponseSchema = z.object({
    url: z.string().url(),
});
export type StreamSongResponse = z.infer<typeof streamSongResponseSchema>;
export const deleteSongRequestSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});
export type DeleteSongRequest = z.infer<typeof deleteSongRequestSchema>;
export const getAllSongsResponseSchema = z.array(
    z.object({
        _id: z.string(),
        title: z.string(),
        uploader: z.string(),
        duration: z.number(),
        mediaUrl: z.string().url(),
        r2Key: z.string().optional(),
        thumbnail: z.string().url(),
        stream_url: z.string().url().optional(),
    })
);

export type GetAllSongsResponse = z.infer<typeof getAllSongsResponseSchema>;
export const extractorsSchema = z.enum(["youtube", "soundcloud"]);
export type ExtractorType = z.infer<typeof extractorsSchema>;
export const getSongsByTypeRequestSchema = z.object({
    params: z.object({
        type: extractorsSchema,
    }),
});

export type GetSongsByTypeRequest = z.infer<typeof getSongsByTypeRequestSchema>;

export const getRecentDownloadsResponseSchema = z.array(
    z.object({
        title: z.string(),
        uploader: z.string(),
        thumbnail: z.string().url(),
        stream_url: z.string().url(),
        _id: z.string(),
    })
);

export type GetRecentDownloadsResponse = z.infer<typeof getRecentDownloadsResponseSchema>;
export const updateListeningTimeRequestSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
    body: z.object({
        time: z.number().min(1),
    }),
});

export type UpdateListeningTimeRequest = z.infer<typeof updateListeningTimeRequestSchema>;

export const getTopListenedSongsResponseSchema = z.array(
    z.object({
        title: z.string(),
        uploader: z.string(),
        thumbnail: z.string().url(),
        stream_url: z.string().url(),
        _id: z.string(),
    })
);

export type GetTopListenedSongsResponse = z.infer<typeof getTopListenedSongsResponseSchema>;

export const createPlaylistRequestSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Playlist name is required"),
        description: z.string().optional(),
    }),
    file: z.any().optional(),
});

export type CreatePlaylistRequest = z.infer<typeof createPlaylistRequestSchema>;

export const createPlaylistResponseSchema = z.object({
    _id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    createdBy: z.string(),
    coverImage: z.string().optional(),
    songs: z.array(z.string()),
});

export type CreatePlaylistResponse = z.infer<typeof createPlaylistResponseSchema>;

export const getPlaylistsResponseSchema = z.array(
    z.object({
        _id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        createdBy: z.object({
            _id: z.string(),
            username: z.string(),
        }),
        coverImage: z.string().optional(),
        songs: z.array(
            z.object({
                _id: z.string(),
                title: z.string(),
                duration: z.number().optional(),
                mediaUrl: z.string(),
            })
        ),
    })
);

export type GetPlaylistsResponse = z.infer<typeof getPlaylistsResponseSchema>;

export const getPlaylistRequestSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});

export type GetPlaylistRequest = z.infer<typeof getPlaylistRequestSchema>;

export const getPlaylistResponseSchema = z.object({
    _id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    createdBy: z.object({
        _id: z.string(),
        username: z.string(),
    }),
    coverImage: z.string().optional(),
    songs: z.array(
        z.object({
            _id: z.string(),
            title: z.string(),
            duration: z.number().optional(),
            mediaUrl: z.string(),
        })
    ),
});

export type GetPlaylistResponse = z.infer<typeof getPlaylistResponseSchema>;

export const updatePlaylistRequestSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
    body: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
    }),
    file: z.any().optional(),
});

export type UpdatePlaylistRequest = z.infer<typeof updatePlaylistRequestSchema>;

export const updatePlaylistResponseSchema = getPlaylistResponseSchema;

export type UpdatePlaylistResponse = z.infer<typeof updatePlaylistResponseSchema>;

export const addSongToPlaylistRequestSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
    body: z.object({
        songId: z.string(),
    }),
});

export type AddSongToPlaylistRequest = z.infer<typeof addSongToPlaylistRequestSchema>;

export const removeSongFromPlaylistRequestSchema = z.object({
    params: z.object({
        id: z.string(),
        songId: z.string(),
    }),
});

export type RemoveSongFromPlaylistRequest = z.infer<typeof removeSongFromPlaylistRequestSchema>;

export const deletePlaylistRequestSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});

export type DeletePlaylistRequest = z.infer<typeof deletePlaylistRequestSchema>;

export const getMostPlayedPlaylistsRequestSchema = z.object({
    params: z.object({
        userId: z.string(),
    }),
});

export type GetMostPlayedPlaylistsRequest = z.infer<typeof getMostPlayedPlaylistsRequestSchema>;

export const getMostPlayedPlaylistsResponseSchema = z.array(
    z.object({
        _id: z.string(),
        name: z.string(),
        coverImage: z.string().optional(),
        description: z.string().optional(),
        playCount: z.number(),
        songs: z.array(
            z.object({
                _id: z.string(),
                title: z.string(),
                mediaUrl: z.string(),
            })
        ),
    })
);

export type GetMostPlayedPlaylistsResponse = z.infer<typeof getMostPlayedPlaylistsResponseSchema>;

export const playPlaylistRequestSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});

export type PlayPlaylistRequest = z.infer<typeof playPlaylistRequestSchema>;
