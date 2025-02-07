import { Button } from "@/components/ui/button";
import React, { useLayoutEffect } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Fetcher from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import { useAudioStore, usePlayerControls } from "@/stores/audioStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Heart, MoreVertical, Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { formatDate } from "../../../lib/utils";
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DashboardPageLayout } from '@/layout/page-layout';
import { BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from '@/components/ui/breadcrumb';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Dialog, DialogDescription, DialogTitle, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Playlist } from '@/features/playlists/nested';
import { useIsMobile } from '@/hooks/use-mobile';
import { DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { AddSongDialog } from '@/features/songs/add-song-dialog';

const api = Fetcher.getInstance();

export interface Song {
    _id: string;
    title: string;
    duration: number;
    mediaUrl: string;
    r2Key: string;
    createdBy: string;
    upload_date: string;
    view_count: number;
    thumbnail: string;
    isFavorited?: boolean;
    tags: string[];
    stream_url: string | undefined;
    original_url: string;
    extractor: string;
    duration_string: string;
    ytdlp_id: string;
    uploader: string;
    createdAt: Date;
    updatedAt: Date;
}

const getSongs = async () => {
    const res = await api.get<Song[]>("/api/songs");
    return res.data;
};

const deleteSong = async (id: string) => {
    await api.delete(`/api/songs/${id}`);
};
const MobileSongsList = ({
    songs,
    onPlay,
    onDelete,
    currentSong
}: {
    songs: Song[];
    onPlay: (id: string) => void;
    onDelete: (id: string) => void
    currentSong: Song | null;
}) => {
    const [sortBy, setSortBy] = useState<'title' | 'date' | 'duration'>('title');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const { isPlaying, isBuffering } = useAudioStore();
    const [showPlaylistDrawer, setShowPlaylistDrawer] = useState(false);
    const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { data: playlists } = useQuery<Playlist[]>({
        queryKey: ["playlists"],
        queryFn: async () => {
            const { data } = await api.get("/api/playlists");
            return data;
        },
    });

    const addSongToPlaylist = useMutation({
        mutationFn: async ({ playlistId, songId }: { playlistId: string, songId: string }) => {
            await api.post(`/api/playlists/${playlistId}/songs`, { songId });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["playlists", variables.playlistId] });
            setShowPlaylistDrawer(false);
            setSelectedSongId(null);
            toast.success("Song added to playlist");
        },
        onError: () => {
            toast.error("Failed to add song to playlist");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["playlists"] });
        },
    });

    const removeSongFromPlaylist = useMutation({
        mutationFn: async ({ playlistId, songId }: { playlistId: string, songId: string }) => {
            await api.delete(`/api/playlists/${playlistId}/songs/${songId}`);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["playlists", variables.playlistId] });
            setShowPlaylistDrawer(false);
            setSelectedSongId(null);
            toast.success("Song removed from playlist");
        },
        onError: () => {
            toast.error("Failed to remove song from playlist");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["playlists"] });
        },
    });

    const handlePlaylistAction = (playlist: Playlist, songId: string) => {
        const songExists = playlist.songs.some(song => song._id === songId);
        if (songExists) {
            removeSongFromPlaylist.mutate({
                playlistId: playlist._id,
                songId
            });
        } else {
            addSongToPlaylist.mutate({
                playlistId: playlist._id,
                songId
            });
        }
    };

    const handleSort = (songs: Song[]) => {
        return [...songs].sort((a, b) => {
            let compareValue = 0;
            switch (sortBy) {
                case 'title':
                    compareValue = a.title.localeCompare(b.title);
                    break;
                case 'date':
                    compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
                case 'duration':
                    compareValue = a.duration - b.duration;
                    break;
            }
            return sortOrder === 'asc' ? compareValue : -compareValue;
        });
    };

    const sortedSongs = handleSort(songs);

    return (
        <div className="flex flex-col">
            <div className="rounded-lg z-10 bg-primary/20 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/70 hover:text-white"
                        >
                            Sort By
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-black/90 backdrop-blur-sm border-none">
                        <DropdownMenuItem onClick={() => setSortBy('title')} className="text-white/70">
                            Title {sortBy === 'title' && '✓'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy('date')} className="text-white/70">
                            Date Added {sortBy === 'date' && '✓'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy('duration')} className="text-white/70">
                            Duration {sortBy === 'duration' && '✓'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="text-white/70">
                            {sortOrder === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Songs List */}
            <div className="flex-1">
                {sortedSongs?.map((song, index) => (
                    <motion.div
                        key={song._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                            "px-2 py-2 flex items-center gap-2 hover:bg-primary/5 transition-colors",
                            index !== songs.length - 1 && "border-b border-primary/10"
                        )}
                        onClick={() => onPlay(song._id)}
                    >
                        {/* Thumbnail */}
                        <div className="relative flex-shrink-0">
                            <img
                                src={song.thumbnail}
                                alt={song.title}
                                className="w-10 h-10 rounded object-cover"
                            />
                            {currentSong?._id === song._id && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded">
                                    {isBuffering ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                        />
                                    ) : isPlaying ? (
                                        <Pause className="h-4 w-4 text-white" />
                                    ) : (
                                        <Play className="h-4 w-4 text-white" />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Song Info */}
                        <div className="flex-1 min-w-0">
                            <div className="text-xs truncate">
                                {song.title}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span className="truncate">{song.uploader}</span>
                                <span>•</span>
                                <span>{song.duration_string}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSongId(song._id);
                                    setShowPlaylistDrawer(true);
                                }}>
                                    <Plus className="h-3.5 w-3.5 mr-2" />
                                    Add to Playlist
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                    <Pencil className="h-3.5 w-3.5 mr-2" />
                                    Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(song._id);
                                    }}
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    Delete Song
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </motion.div>
                ))}
            </div>

            <Dialog open={showPlaylistDrawer} onOpenChange={setShowPlaylistDrawer}>
                <DialogContent className="bg-black/90 backdrop-blur-lg border-purple-500/50 rounded-lg sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add to Playlist</DialogTitle>
                        <DialogDescription>
                            Select a playlist to add this song to
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto space-y-2">
                        {playlists?.map((playlist) => {
                            const songExists = selectedSongId && playlist.songs.some(song => song._id === selectedSongId);
                            return (
                                <div
                                    key={playlist._id}
                                    className={cn(
                                        "flex items-center gap-4 p-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors",
                                        songExists && "bg-purple-500/10"
                                    )}
                                    onClick={() => {
                                        if (selectedSongId) {
                                            handlePlaylistAction(playlist, selectedSongId);
                                        }
                                    }}
                                >
                                    <img
                                        src={playlist.coverImage || "/default-cover.svg"}
                                        alt={playlist.name}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium">{playlist.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {playlist.songs.length} songs
                                        </div>
                                    </div>
                                    {songExists && (
                                        <div className="flex items-center gap-1 text-xs text-purple-400">
                                            <span>Added</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 hover:text-red-400"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPlaylistDrawer(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const DesktopSongsList = React.memo(({ songs, onPlay, onDelete }: {
    songs: Song[];
    onPlay: (id: string) => void;
    onDelete: (id: string) => void;
}) => {
    const queryClient = useQueryClient();
    const { currentSong, isPlaying, isBuffering } = useAudioStore();
    const [editingField, setEditingField] = useState<{id: string, field: string} | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showPlaylistDrawer, setShowPlaylistDrawer] = useState(false);
    const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{
        key: SortKey;
        direction: 'asc' | 'desc';
    }>({ key: 'upload_date', direction: 'desc' });

    const { data: playlists } = useQuery<Playlist[]>({
        queryKey: ["playlists"],
        queryFn: async () => {
            const { data } = await api.get("/api/playlists");
            return data;
        },
    });

    const addSongToPlaylist = useMutation({
        mutationFn: async ({ playlistId, songId }: { playlistId: string, songId: string }) => {
            await api.post(`/api/playlists/${playlistId}/songs`, { songId });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["playlists", variables.playlistId] });
            setShowPlaylistDrawer(false);
            setSelectedSongId(null);
            toast.success("Song added to playlist");
        },
        onError: () => {
            toast.error("Failed to add song to playlist");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["playlists"] });
        },
    });

    const removeSongFromPlaylist = useMutation({
        mutationFn: async ({ playlistId, songId }: { playlistId: string, songId: string }) => {
            await api.delete(`/api/playlists/${playlistId}/songs/${songId}`);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["playlists", variables.playlistId] });
            setShowPlaylistDrawer(false);
            setSelectedSongId(null);
            toast.success("Song removed from playlist");
        },
        onError: () => {
            toast.error("Failed to remove song from playlist");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["playlists"] });
        },
    });

    const handlePlaylistAction = (playlist: Playlist, songId: string) => {
        const songExists = playlist.songs.some(song => song._id === songId);
        if (songExists) {
            removeSongFromPlaylist.mutate({
                playlistId: playlist._id,
                songId
            });
        } else {
            addSongToPlaylist.mutate({
                playlistId: playlist._id,
                songId
            });
        }
    };

    const editMutation = useMutation({
        mutationFn: async ({ id, field, value }: { id: string, field: string, value: string }) => {
            if (isEditing) return null;
            setIsEditing(true);
            try {
                const response = await api.patch(`/api/songs/${id}`, {
                    [field]: value,
                });
                if (response.status !== 200) {
                    throw new Error('Failed to update song');
                }
                return response.data;
            } finally {
                setIsEditing(false);
            }
        },
        onSuccess: (data) => {
            if (data) {
                queryClient.invalidateQueries({ queryKey: ['songs'] });
                setEditingField(null);
                toast.success('Song updated successfully');
            }
        },
        onError: () => {
            toast.error('Failed to update song. Please try again later');
        }
    });

    type FavoriteState = "added" | "removed" | "failed";

    const favoriteMutation = useMutation<FavoriteState, Error, string>({
        mutationFn: async (songId: string) => {
            const response = await api.post('/users/media/favorite/song', {
                itemId: songId
            });
            return response.data.favoriteState as FavoriteState;
        },
        onSuccess: (state: FavoriteState) => {
            queryClient.invalidateQueries({ queryKey: ['songs'] });
            if (state === "added") {
                toast.success('Song added to favorites');
            } else if (state === "removed") {
                toast.success('Song removed from favorites');
            } else {
                toast.error('Failed to favorite song');
            }
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to favorite song');
            queryClient.invalidateQueries({ queryKey: ['songs'] });
        }
    });

    const handleSubmit = useCallback((song: Song, field: string, value: string) => {
        if (value !== song[field as keyof Song] && !isEditing) {
            editMutation.mutate({
                id: song._id,
                field,
                value
            });
        }
        setEditingField(null);
    }, [editMutation, isEditing]);

    const handleFavorite = useCallback((songId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        favoriteMutation.mutate(songId);
    }, [favoriteMutation]);

    const handleDelete = useCallback((songId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(songId);
    }, [onDelete]);

    const handleEditClick = useCallback((songId: string, field: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingField({id: songId, field});
    }, []);

    const isMobile = useIsMobile();

    return (
        <>
            {songs.map((song) => (
                <TableRow
                    key={song._id}
                    className={cn(
                        "border-b-0 h-10 cursor-pointer group transition-none",
                        { "bg-secondary/30": song._id === currentSong?._id }
                    )}
                    onClick={() => onPlay(song._id)}
                >
                    <TableCell className="py-1">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <img
                                    src={song.thumbnail}
                                    alt={`${song.title} thumbnail`}
                                    className="rounded-sm object-cover size-8"
                                />
                                <AnimatePresence mode="wait">
                                    {song._id === currentSong?._id && (
                                        <motion.div
                                            className="absolute inset-0 bg-black/80 flex items-center justify-center"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                duration: 0.05
                                            }}
                                        >
                                            <div className="flex items-center justify-center gap-[2px] w-full">
                                                {[0, 1, 2, 3].map((i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="w-[2px] bg-purple-500 rounded-full"
                                                        animate={{
                                                            height: isBuffering
                                                                ? ["10px", "16px", "10px"]
                                                                : isPlaying
                                                                    ? ["14px", "8px", "14px"]
                                                                    : "10px",
                                                            opacity: isPlaying ? 1 : 0.5
                                                        }}
                                                        transition={{
                                                            duration: 0.4,
                                                            repeat: Infinity,
                                                            repeatType: "reverse",
                                                            delay: i * 0.1,
                                                            ease: "linear"
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                                <div
                                    className={cn(
                                        "w-full max-w-[550px] lg:max-w-[800px] px-1 group-hover:relative rounded",
                                        editingField?.id === song._id && editingField?.field === 'title' && "ring-1 ring-primary"
                                    )}
                                >
                                    {editingField?.id === song._id && editingField?.field === 'title' ? (
                                        <input
                                            type="text"
                                            defaultValue={song.title}
                                            className="w-full bg-transparent border-none focus:outline-none"
                                            onBlur={(e) => handleSubmit(song, 'title', e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSubmit(song, 'title', e.currentTarget.value);
                                                    e.currentTarget.blur();
                                                }
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            autoFocus
                                        />
                                    ) : (
                                            <div className="flex items-center gap-2">
                                                <span>{song.title}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity p-1 translate-y-[-1px]"
                                                    onClick={(e) => handleEditClick(song._id, 'title', e)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                                </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs py-1">
                        {song.duration_string}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs py-1">
                        {song.uploader}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs py-1">
                        {new Date(parseInt(song.upload_date) * 1000).toLocaleDateString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric'
                        })}
                    </TableCell>
                    <TableCell className="text-right py-1">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                            <Tooltip delayDuration={500} disableHoverableContent={isMobile}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 hover:text-primary"
                                        onClick={(e) => handleFavorite(song._id, e)}
                                    >
                                        {song.isFavorited ? (
                                            <Heart className="h-3.5 w-3.5 fill-red-500 stroke-red-500" />
                                        ) : (
                                            <Heart className="h-3.5 w-3.5" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {song.isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip delayDuration={500} disableHoverableContent={isMobile}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 hover:text-primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedSongId(song._id);
                                            setShowPlaylistDrawer(true);
                                        }}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Add to Playlist
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip delayDuration={500} disableHoverableContent={isMobile}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 hover:text-destructive"
                                        onClick={(e) => handleDelete(song._id, e)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Delete Song
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
}) as React.FC<{
    songs: Song[];
    onPlay: (id: string) => void;
    onDelete: (id: string) => void;
}>;

type SortKey = 'title' | 'duration' | 'uploader' | 'upload_date';

interface SortIconProps {
    active: boolean;
    direction: 'asc' | 'desc';
}

interface SortableHeaderProps {
    label: string;
    sortKey: SortKey;
}

export function SongsView() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [songsPerPage, setSongsPerPage] = useState(25);
    const queryClient = useQueryClient();
    const query = useQuery({ queryKey: ["songs"], queryFn: getSongs });
    const [sortConfig, setSortConfig] = useState<{
        key: SortKey;
        direction: 'asc' | 'desc';
    }>({ key: 'upload_date', direction: 'desc' });

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    }, []);

    const handleSort = useCallback((key: SortKey) => {
        setSortConfig(current => {
            if (current.key === key) {
                // If clicking the same column, toggle direction
                return {
                    key,
                    direction: current.direction === 'asc' ? 'desc' : 'asc'
                };
            }
            // If clicking a new column, default to ascending
            return {
                key,
                direction: 'asc'
            };
        });
    }, []);

    const sortedAndFilteredSongs = useMemo(() => {
        const filtered = query?.data?.filter(
            (song) =>
                song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                song.uploader.toLowerCase().includes(searchTerm.toLowerCase()) ||
                song.tags.some((tag) =>
                    tag.toLowerCase().includes(searchTerm.toLowerCase())
                )
        ) || [];

        return [...filtered].sort((a, b) => {
            let compareResult = 0;
            switch (sortConfig.key) {
                case 'title':
                    compareResult = a.title.localeCompare(b.title);
                    break;
                case 'duration':
                    compareResult = a.duration - b.duration;
                    break;
                case 'uploader':
                    compareResult = a.uploader.localeCompare(b.uploader);
                    break;
                case 'upload_date':
                    compareResult = parseInt(a.upload_date) - parseInt(b.upload_date);
                    break;
                default:
                    compareResult = 0;
            }
            return sortConfig.direction === 'asc' ? compareResult : -compareResult;
        });
    }, [query.data, searchTerm, sortConfig]);

    const { currentSongs, totalPages } = useMemo(() => {
        const indexOfLastSong = currentPage * songsPerPage;
        const indexOfFirstSong = indexOfLastSong - songsPerPage;
        const currentSongs = sortedAndFilteredSongs?.slice(indexOfFirstSong, indexOfLastSong) || [];
        const totalPages = Math.ceil((sortedAndFilteredSongs?.length || 0) / songsPerPage);
        return { currentSongs, totalPages };
    }, [currentPage, sortedAndFilteredSongs, songsPerPage]);

    const { playSong } = usePlayerControls();
    const { currentSong } = useAudioStore();

    const removeSong = useMutation({
        mutationFn: deleteSong,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["songs"] });
        },
    });

    const handleDelete = useCallback((id: string) => {
        removeSong.mutate(id);
    }, [removeSong]);

    const handleSongsPerPageChange = useCallback((value: number) => {
        setSongsPerPage(value);
        setCurrentPage(1);
    }, []);

    return (
        <div className="flex flex-col h-full">
            <DashboardPageLayout breadcrumbs={
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink>Songs</BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            }>
                <div className="flex flex-col flex-1 h-full">
                    <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                        <div className="md:hidden h-full overflow-y-auto">
                            <div className="space-y-2">
                                <MobileSongsList
                                    songs={currentSongs}
                                    onPlay={playSong}
                                    onDelete={handleDelete}
                                    currentSong={currentSong as Song | null}
                                />
                            </div>
                        </div>

                        <div className="hidden md:flex flex-col flex-1 min-h-0">
                            <div className="flex-1 overflow-auto">
                                <Table>
                                    <TableHeader className="bg-secondary/5 backdrop-blur-sm sticky top-0 z-10">
                                        <TableRow className="border-b-0 hover:bg-transparent">
                                            <TableHead
                                                className="w-[60%] lg:w-[70%] h-10"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center cursor-pointer" onClick={() => handleSort('title')}>
                                                            Song
                                                            <div className={cn("inline-flex flex-col ml-1 relative -top-[1px]", sortConfig.key !== 'title' && "opacity-0 group-hover:opacity-100")}>
                                                                <ChevronUp className={cn("h-2.5 w-2.5", sortConfig.key === 'title' && sortConfig.direction === 'asc' && "text-purple-500")} />
                                                                <ChevronDown className={cn("h-2.5 w-2.5 -mt-1", sortConfig.key === 'title' && sortConfig.direction === 'desc' && "text-purple-500")} />
                                                            </div>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 px-2 text-muted-foreground hover:text-primary"
                                                                >
                                                                    {songsPerPage} per page
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="start" className="w-48">
                                                                <DropdownMenuLabel>Songs per page</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuRadioGroup value={songsPerPage.toString()} onValueChange={(value) => handleSongsPerPageChange(Number(value))}>
                                                                    <DropdownMenuRadioItem value="5">5 songs</DropdownMenuRadioItem>
                                                                    <DropdownMenuRadioItem value="10">10 songs</DropdownMenuRadioItem>
                                                                    <DropdownMenuRadioItem value="15">15 songs</DropdownMenuRadioItem>
                                                                    <DropdownMenuRadioItem value="20">20 songs</DropdownMenuRadioItem>
                                                                    <DropdownMenuRadioItem value="25">25 songs</DropdownMenuRadioItem>
                                                                </DropdownMenuRadioGroup>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-auto flex-1">
                                                        <div className="flex-1">
                                                            <Input
                                                                placeholder="Search songs..."
                                                                value={searchTerm}
                                                                onChange={handleSearch}
                                                                className="w-full h-7 bg-secondary/30 border-secondary/30 text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 backdrop-blur-sm"
                                                            />
                                                        </div>
                                                        <AddSongDialog>
                                                            <Button
                                                                size="sm"
                                                                className="h-7 px-3 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 transition-colors backdrop-blur-sm"
                                                            >
                                                                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Song
                                                            </Button>
                                                        </AddSongDialog>
                                                    </div>
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="h-10 cursor-pointer group"
                                                onClick={() => handleSort('duration')}
                                            >
                                                <div className="flex items-center">
                                                    Duration
                                                    <div className={cn("inline-flex flex-col ml-1 relative -top-[1px]", sortConfig.key !== 'duration' && "opacity-0 group-hover:opacity-100")}>
                                                        <ChevronUp className={cn("h-2.5 w-2.5", sortConfig.key === 'duration' && sortConfig.direction === 'asc' && "text-purple-500")} />
                                                        <ChevronDown className={cn("h-2.5 w-2.5 -mt-1", sortConfig.key === 'duration' && sortConfig.direction === 'desc' && "text-purple-500")} />
                                                    </div>
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="h-10 cursor-pointer group"
                                                onClick={() => handleSort('uploader')}
                                            >
                                                <div className="flex items-center">
                                                    Uploader
                                                    <div className={cn("inline-flex flex-col ml-1 relative -top-[1px]", sortConfig.key !== 'uploader' && "opacity-0 group-hover:opacity-100")}>
                                                        <ChevronUp className={cn("h-2.5 w-2.5", sortConfig.key === 'uploader' && sortConfig.direction === 'asc' && "text-purple-500")} />
                                                        <ChevronDown className={cn("h-2.5 w-2.5 -mt-1", sortConfig.key === 'uploader' && sortConfig.direction === 'desc' && "text-purple-500")} />
                                                    </div>
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="h-10 cursor-pointer group"
                                                onClick={() => handleSort('upload_date')}
                                            >
                                                <div className="flex items-center">
                                                    Added
                                                    <div className={cn("inline-flex flex-col ml-1 relative -top-[1px]", sortConfig.key !== 'upload_date' && "opacity-0 group-hover:opacity-100")}>
                                                        <ChevronUp className={cn("h-2.5 w-2.5", sortConfig.key === 'upload_date' && sortConfig.direction === 'asc' && "text-purple-500")} />
                                                        <ChevronDown className={cn("h-2.5 w-2.5 -mt-1", sortConfig.key === 'upload_date' && sortConfig.direction === 'desc' && "text-purple-500")} />
                                                    </div>
                                                </div>
                                            </TableHead>
                                            <TableHead className="w-[100px] text-right h-10">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="[&_tr:hover]:bg-secondary/40">
                                        <DesktopSongsList
                                            songs={currentSongs}
                                            onPlay={playSong}
                                            onDelete={handleDelete}
                                        />
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <div className="flex justify-center py-4 mt-2">
                            <div className="flex items-center space-x-2 bg-purple-900/20 rounded-lg px-2 py-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="text-purple-300 hover:text-purple-200 disabled:opacity-50"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm text-purple-300">
                                    {currentPage} / {totalPages}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="text-purple-300 hover:text-purple-200 disabled:opacity-50"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardPageLayout>
        </div>
    );
}

export default SongsView;