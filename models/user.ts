import { Schema, model } from "mongoose";
import { z } from "zod";
import { playlistZodSchema } from "./playlist";
import { songZodSchema } from "./song";

const userSchema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        name: { type: String, required: false },
        pfp: { type: String, required: false },
        bio: { type: String, required: false },
        songs: [{ type: Schema.Types.ObjectId, ref: "Song" }],
        playlists: [{ type: Schema.Types.ObjectId, ref: "Playlist" }],
        favoriteSongs: [{ type: Schema.Types.ObjectId, ref: "Song" }],
        favoritePlaylists: [{ type: Schema.Types.ObjectId, ref: "Playlist" }]
    },
    { timestamps: true }
);

const User = model("User", userSchema);

export const userZodSchema = z.object({
    username: z.string(),
    email: z.string().email(),
    password: z.string(),
    name: z.string().optional(),
    pfp: z.string().optional(),
    bio: z.string().optional(),
    songs: z.array(songZodSchema).optional(),
    playlists: z.array(playlistZodSchema).optional(),
    favoriteSongs: z.array(songZodSchema).optional(),
    favoritePlaylists: z.array(playlistZodSchema).optional(),
});

export type UserModel = z.infer<typeof userZodSchema>;

export default User;
