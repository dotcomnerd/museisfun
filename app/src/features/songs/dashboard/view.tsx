import { Button } from "@/components/ui/button";
import React from "react";
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

const DesktopSongsList = React.memo(({ songs, onPlay, onDelete }: {
    songs: Song[];
    onPlay: (id: string) => void;
    onDelete: (id: string) => void;
}) => {
    const queryClient = useQueryClient();
    const { currentSong, isPlaying, isBuffering } = useAudioStore();
    const [editingField, setEditingField] = useState<{id: string, field: string} | null>(null);
    const [isEditing, setIsEditing] = useState(false);

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

    const renderSongRow = useCallback((song: Song) => {
        const isCurrentSong = song?._id === currentSong?._id;

        return (
            <TableRow
                key={song._id}
                className={cn(
                    "border-none hover:bg-secondary/40 transition-colors cursor-pointer group h-12",
                    {"bg-secondary/30": isCurrentSong}
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
                                {isCurrentSong && (
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
                            <div className="flex items-center gap-2 flex-1">
                                <motion.div
                                    layout
                                    className={cn(
                                        "font-medium w-full max-w-[550px] lg:max-w-[800px] px-1 group-hover:relative rounded",
                                        editingField?.id === song._id && editingField?.field === 'title' && "ring-1 ring-primary"
                                    )}
                                >
                                    <AnimatePresence mode="wait">
                                        {editingField?.id === song._id && editingField?.field === 'title' ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 4 }}
                                                transition={{ duration: 0.15 }}
                                            >
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
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -4 }}
                                                transition={{ duration: 0.15 }}
                                                className="flex items-center gap-2"
                                            >
                                                <span>{song.title}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity p-1 translate-y-[-1px]"
                                                    onClick={(e) => handleEditClick(song._id, 'title', e)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                                </Button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
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
                <TableCell className="text-muted-foreground text-xs min-w-[150px] py-1">{formatDate(song.upload_date)}</TableCell>
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
        );
    }, [currentSong?._id, isPlaying, isBuffering, editingField, handleSubmit, handleFavorite, handleDelete, handleEditClick, isMobile, onPlay]);

    return (
        <div className="rounded-md border-none backdrop-blur-sm bg-secondary/10">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-secondary/20">
                        <TableHead className="w-[60%] lg:w-[70%]">Song</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Uploader</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {songs?.map(renderSongRow)}
                </TableBody>
            </Table>
        </div>
    );
}) as React.FC<{
    songs: Song[];
    onPlay: (id: string) => void;
    onDelete: (id: string) => void;
}>;

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

    const filteredSongs = useMemo(() => query?.data?.filter(
        (song) =>
            song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            song.uploader.toLowerCase().includes(searchTerm.toLowerCase()) ||
            song.tags.some((tag) =>
                tag.toLowerCase().includes(searchTerm.toLowerCase())
            )
    ), [query.data, searchTerm]);

    const { currentSongs, totalPages } = useMemo(() => {
        const indexOfLastSong = currentPage * songsPerPage;
        const indexOfFirstSong = indexOfLastSong - songsPerPage;
        const currentSongs = filteredSongs?.slice(indexOfFirstSong, indexOfLastSong) || [];
        const totalPages = Math.ceil((filteredSongs?.length || 0) / songsPerPage);
        return { indexOfLastSong, indexOfFirstSong, currentSongs, totalPages };
    }, [currentPage, filteredSongs]);

    const { playSong } = usePlayerControls();
    const { currentSong } = useAudioStore();

    const handleDelete = useCallback((id: string) => {
        removeSong.mutate(id);
    }, [removeSong]);

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
                <div className="flex-1 min-h-0 overflow-y-auto">
                    {/* Mobile view */}
                    <div className="md:hidden h-full">
                        <div className="space-y-2">
                            <MobileSongsList
                                songs={currentSongs}
                                onPlay={playSong}
                                onDelete={handleDelete}
                                currentSong={currentSong as Song | null}
                            />
                        </div>
                    </div>

                    {/* Desktop view */}
                    <div className="hidden md:block h-full">
                        <div className="space-y-1">
                            <DesktopSongsList
                                songs={currentSongs}
                                onPlay={playSong}
                                onDelete={handleDelete}
                            />
                        </div>
                    </div>
                </div>

                {/* Compact Pagination */}
                <div className="flex justify-center py-4 mt-auto">
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
        </div>
    );
}

export default SongsView;