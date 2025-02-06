import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { DashboardPageLayout } from "@/layout/page-layout";
import Fetcher from "@/lib/fetcher";
import { cn, formatDate, formatDuration } from "@/lib/utils";
import { usePlayerControls, useAudioStore } from "@/stores/audioStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Loader2, MoreVertical, Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Song } from '../songs/dashboard/view';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";
import { useIsMobile } from '@/hooks/use-mobile';
const api = Fetcher.getInstance();

type FavoriteState = "added" | "removed" | "failed";

export function FavoritesView() {
    const [searchTerm, setSearchTerm] = useState("");
    const queryClient = useQueryClient();
    const { playSong } = usePlayerControls();
    const { currentSong, isPlaying, isBuffering } = useAudioStore();
    const isMobile = useIsMobile();

    const { data: favorites, isLoading } = useQuery({
        queryKey: ["favorite-tracks"],
        queryFn: async () => {
            const { data } = await Fetcher.getInstance().get("/users/media/favorite/song");
            return data as Song[];
        }
    });

    const removeFavorite = useMutation({
        mutationFn: async (songId: string) => {
            await api.post('/users/media/favorite/song', {
                itemId: songId
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["favorite-tracks"] });
            toast.success("Removed from favorites");
        },
        onError: () => {
            toast.error("Failed to remove from favorites");
        }
    });

    const filteredFavorites = favorites?.filter(
        (song: Song) =>
            song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            song.uploader.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardPageLayout breadcrumbs={
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink>Favorites</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        }>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold">Your Favorites</h1>
                    <Input
                        placeholder="Search favorites..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm backdrop-blur-lg"
                    />
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center min-h-[200px]">
                        <Loader2 className="animate-spin text-purple-500 w-8 h-8" />
                    </div>
                ) : (
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
                                {filteredFavorites?.map((song: Song) => {
                                    const isCurrentSong = song._id === currentSong?._id;

                                    return (
                                        <TableRow
                                            key={song._id}
                                            className={cn(
                                                "border-none hover:bg-secondary/40 transition-colors cursor-pointer group h-12",
                                                {"bg-secondary/30": isCurrentSong}
                                            )}
                                            onClick={() => playSong(song._id)}
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
                                                                    transition={{ duration: 0.05 }}
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
                                                    <span className="font-medium">{song.title}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs py-1">
                                                {formatDuration(song.duration)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs py-1">
                                                {song.uploader}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs py-1">
                                                {formatDate(song.upload_date)}
                                            </TableCell>
                                            <TableCell className="text-right py-1">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                                                    <Tooltip delayDuration={500} disableHoverableContent={isMobile}>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 hover:text-primary"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeFavorite.mutate(song._id);
                                                                }}
                                                            >
                                                                <Heart className="h-3.5 w-3.5 fill-red-500 stroke-red-500" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Remove from Favorites
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
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </DashboardPageLayout>
    );
}
