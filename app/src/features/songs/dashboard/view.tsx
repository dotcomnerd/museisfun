import { Button } from "@/components/ui/button";
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
import { ChevronLeft, ChevronRight, Heart, MoreVertical, Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
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
    const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
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

    const handleLongPress = () => {
        setIsSelectionMode(true);
    };

    const handleSongSelect = (songId: string) => {
        if (isSelectionMode) {
            setSelectedSongs(prev =>
                prev.includes(songId)
                    ? prev.filter(id => id !== songId)
                    : [...prev, songId]
            );
        } else {
            onPlay(songId);
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

    const handleBulkDelete = async () => {
        try {
            await Promise.all(selectedSongs.map(id => onDelete(id)));
            toast.success('Songs deleted successfully');
            setSelectedSongs([]);
            setIsSelectionMode(false);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Failed to delete songs');
            }
        }
    };

    return (
        <div className="flex flex-col">
            <div className="rounded-lg z-10 bg-primary/20 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
                {isSelectionMode ? (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setIsSelectionMode(false);
                                setSelectedSongs([]);
                            }}
                            className="text-white/70 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <span className="text-sm text-white/70">
                            {selectedSongs.length} selected
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBulkDelete}
                            className="text-red-400 hover:text-red-300"
                        >
                            Delete
                        </Button>
                    </>
                ) : (
                    <>
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
                    </>
                )}
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
                            index !== songs.length - 1 && "border-b border-primary/10",
                            isSelectionMode && "hover:bg-transparent",
                            selectedSongs.includes(song._id) && "bg-primary/10"
                        )}
                        onTouchStart={() => {
                            const timer = setTimeout(handleLongPress, 500);
                            return () => clearTimeout(timer);
                        }}
                        onClick={() => handleSongSelect(song._id)}
                    >
                        {/* Selection Checkbox */}
                        {isSelectionMode && (
                            <div className="flex-shrink-0">
                                <input
                                    type="checkbox"
                                    checked={selectedSongs.includes(song._id)}
                                    onChange={() => handleSongSelect(song._id)}
                                    className="rounded-sm"
                                />
                            </div>
                        )}

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
                            <div className="font-medium text-xs truncate">
                                {song.title}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span className="truncate">{song.uploader}</span>
                                <span>•</span>
                                <span>{song.duration_string}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        {!isSelectionMode && (
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
                                        onPlay(song._id);
                                    }}>
                                        {currentSong?._id === song._id ? (
                                            <Pause className="h-3.5 w-3.5 mr-2" />
                                        ) : (
                                            <Play className="h-3.5 w-3.5 mr-2" />
                                        )}
                                        {currentSong?._id === song._id ? "Pause" : "Play"}
                                    </DropdownMenuItem>
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
                                        <s>Edit Details</s>
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
                        )}
                    </motion.div>
                ))}
            </div>

            <Dialog open={showPlaylistDrawer} onOpenChange={setShowPlaylistDrawer}>
                <DialogContent className="bg-black/10 backdrop-blur-lg border-purple-500/50 rounded-lg sm:w-[400px] max-w-[90vw]">
                    <DialogHeader>
                        <DialogTitle>Add to Playlist</DialogTitle>
                        <DialogDescription>
                            Select a playlist to add this song to
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto space-y-2">
                        {playlists?.map((playlist) => (
                            <div
                                key={playlist._id}
                                className="flex items-center gap-4 p-2 hover:bg-black/10 rounded-md cursor-pointer"
                                onClick={() => {
                                    if (selectedSongId) {
                                        addSongToPlaylist.mutate({
                                            playlistId: playlist._id,
                                            songId: selectedSongId
                                        });
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
                            </div>
                        ))}
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

const DesktopSongsList = ({ songs, onPlay, onDelete }:
    { songs: Song[]; onPlay: (id: string) => void; onDelete: (id: string) => void }
) => {
    const queryClient = useQueryClient();
    const { currentSong, isPlaying, isBuffering } = useAudioStore();
    const [editingField, setEditingField] = useState<{id: string, field: string} | null>(null);
    const [hoveredField, setHoveredField] = useState<{id: string, field: string} | null>(null);

    const editMutation = useMutation({
        mutationFn: async ({ id, field, value }: { id: string, field: string, value: string }) => {
            const response = await api.patch(`/api/songs/${id}`, {
                [field]: value,
            });
            if (response.status !== 200) {
                throw new Error('Failed to update song');
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['songs'] });
            toast.success('Song updated successfully');
            setEditingField(null);
        },
        onError: () => {
            toast.error('Failed to update song');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['songs'] });
        },
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

    const handleSubmit = (song: Song, field: string, value: string) => {
        if (value !== song[field as keyof Song]) {
            editMutation.mutate({
                id: song._id,
                field,
                value
            });
        }
        setEditingField(null);
    };

    return (
        <div className="rounded-md border-none backdrop-blur-sm bg-secondary/10">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-secondary/20">
                        <TableHead className="w-[700px]">Song</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Uploader</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead className="w-[150px] text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {songs?.map((song) => (
                        <TableRow
                            key={song._id}
                            className={cn(
                                "border-none hover:bg-secondary/20 transition-colors cursor-pointer group",
                                {"bg-secondary/30": song?._id === currentSong?._id}
                            )}
                            onClick={() => onPlay(song._id)}
                        >
                            <TableCell>
                                <div className="flex items-center gap-4">
                                    <AnimatePresence mode="wait">
                                        {currentSong?._id === song._id && (
                                            <motion.div
                                                className="flex items-end gap-1 h-5 mr-2"
                                                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.8, x: -10 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 25
                                                }}
                                            >
                                                {[0, 1, 2, 3].map((i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="w-[2px] bg-purple-500 rounded-full mx-[1px]"
                                                        initial={{ height: "8px" }}
                                                        animate={{
                                                            height: isBuffering
                                                                ? ["8px", "12px", "4px", "16px"][i]
                                                                : isPlaying
                                                                    ? ["8px", "16px", "4px", "12px"]
                                                                    : "8px"
                                                        }}
                                                        transition={{
                                                            duration: 1.2,
                                                            repeat: isPlaying ? Infinity : 0,
                                                            repeatType: "reverse",
                                                            delay: i * 0.2,
                                                            ease: [0.76, 0, 0.24, 1]
                                                        }}
                                                    />
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <div className="relative">
                                        <img
                                            src={song.thumbnail}
                                            alt={`${song.title} thumbnail`}
                                            className="rounded-md object-cover w-10 h-10"
                                        />
                                    </div>
                                    <div
                                        className="flex items-center gap-2 flex-1"
                                        onMouseEnter={() => setHoveredField({id: song._id, field: 'title'})}
                                        onMouseLeave={() => setHoveredField(null)}
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <input
                                                type="text"
                                                defaultValue={song.title}
                                                className={cn(
                                                    "font-medium bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 w-full max-w-[550px]",
                                                    editingField?.id === song._id && editingField?.field === 'title' && "ring-1 ring-primary"
                                                )}
                                                onFocus={() => setEditingField({id: song._id, field: 'title'})}
                                                onBlur={(e) => handleSubmit(song, 'title', e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSubmit(song, 'title', e.currentTarget.value);
                                                        e.currentTarget.blur();
                                                    }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <div className="w-6">
                                                {hoveredField?.id === song._id && hoveredField?.field === 'title' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 transition-opacity"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingField({id: song._id, field: 'title'});
                                                        }}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                <div
                                    className="flex items-center gap-2"
                                    onMouseEnter={() => setHoveredField({id: song._id, field: 'duration_string'})}
                                    onMouseLeave={() => setHoveredField(null)}
                                >
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            defaultValue={song.duration_string}
                                            className={cn(
                                                "bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary rounded px-1",
                                                editingField?.id === song._id && editingField?.field === 'duration_string' && "ring-1 ring-primary"
                                            )}
                                            onFocus={() => setEditingField({id: song._id, field: 'duration_string'})}
                                            onBlur={(e) => handleSubmit(song, 'duration_string', e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSubmit(song, 'duration_string', e.currentTarget.value);
                                                    e.currentTarget.blur();
                                                }
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="w-6">
                                            {hoveredField?.id === song._id && hoveredField?.field === 'duration_string' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 transition-opacity"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingField({id: song._id, field: 'duration_string'});
                                                    }}
                                                >
                                                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                <div
                                    className="flex items-center gap-2"
                                    onMouseEnter={() => setHoveredField({id: song._id, field: 'uploader'})}
                                    onMouseLeave={() => setHoveredField(null)}
                                >
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            defaultValue={song.uploader}
                                            className={cn(
                                                "bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary rounded px-1",
                                                editingField?.id === song._id && editingField?.field === 'uploader' && "ring-1 ring-primary"
                                            )}
                                            onFocus={() => setEditingField({id: song._id, field: 'uploader'})}
                                            onBlur={(e) => handleSubmit(song, 'uploader', e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSubmit(song, 'uploader', e.currentTarget.value);
                                                    e.currentTarget.blur();
                                                }
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="w-6">
                                            {hoveredField?.id === song._id && hoveredField?.field === 'uploader' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 transition-opacity"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingField({id: song._id, field: 'uploader'});
                                                    }}
                                                >
                                                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{formatDate(song.upload_date)}</TableCell>
                            <TableCell className="text-right">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 hover:text-primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onPlay(song._id);
                                            }}
                                        >
                                            {currentSong?._id === song._id ? (
                                                <Pause className="h-3.5 w-3.5" />
                                            ) : (
                                                <Play className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {currentSong?._id === song._id ? 'Pause' : 'Play'}
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 hover:text-primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                favoriteMutation.mutate(song._id);
                                            }}
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
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 hover:text-primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Add to playlist logic
                                            }}
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Add to Playlist
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 hover:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(song._id);
                                            }}
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
                </TableBody>
            </Table>
        </div>
    );
};

// Main Songs View Component
export function SongsView() {
    const { searchTerm } = useAudioStore();
    const [currentPage, setCurrentPage] = useState(1);
    const songsPerPage = 10;
    const queryClient = useQueryClient();
    const query = useQuery({ queryKey: ["songs"], queryFn: getSongs });
    const removeSong = useMutation({
        mutationFn: deleteSong,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["songs"] });
        },
    });

    const filteredSongs = query?.data?.filter(
        (song) =>
            song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            song.uploader.toLowerCase().includes(searchTerm.toLowerCase()) ||
            song.tags.some((tag) =>
                tag.toLowerCase().includes(searchTerm.toLowerCase())
            )
    );

    const indexOfLastSong = currentPage * songsPerPage;
    const indexOfFirstSong = indexOfLastSong - songsPerPage;
    const currentSongs = filteredSongs?.slice(indexOfFirstSong, indexOfLastSong) || [];
    const totalPages = Math.ceil((filteredSongs?.length || 0) / songsPerPage);

    const { playSong } = usePlayerControls();
    const { currentSong } = useAudioStore();

    return (
        <DashboardPageLayout breadcrumbs={
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink>Songs</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        }>
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                {/* Mobile view */}
                <div className="md:hidden">
                    <div className="space-y-2">
                        <MobileSongsList
                            songs={currentSongs}
                            onPlay={playSong}
                            onDelete={(id) => removeSong.mutate(id)}
                            currentSong={currentSong as Song | null}
                        />
                    </div>
                </div>

                {/* Desktop view */}
                <div className="hidden md:block">
                    <div className="space-y-1">
                        <DesktopSongsList
                            songs={currentSongs}
                            onPlay={playSong}
                            onDelete={(id) => removeSong.mutate(id)}
                        />
                    </div>
                </div>

                {/* Compact Pagination */}
                <div className="mt-4 flex justify-center">
                    <div className="flex items-center space-x-2 bg-purple-900/20 rounded-lg px-2 py-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            className="text-purple-300 hover:text-purple-200"
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
                            className="text-purple-300 hover:text-purple-200"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardPageLayout>
    );
}

export default SongsView;