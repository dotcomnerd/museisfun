import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Fetcher from "@/lib/fetcher";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Music } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const api = Fetcher.getInstance();

// Validation schema
const addSongSchema = z.object({
  url: z
    .string()
    .url("Please enter a valid URL")
    .refine(
      (url) =>
        url.includes("youtube.com") ||
        url.includes("youtu.be") ||
        url.includes("soundcloud.com") ||
        url.includes("music.apple.com") ||
        url.includes("spotify.com") ||
        url.includes("last.fm/music"),
      "URL must be from YouTube, SoundCloud, Apple Music, Spotify, or Last.fm"
    ),
});

type AddSongInput = z.infer<typeof addSongSchema>;

export function AddSongDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddSongInput>({
    resolver: zodResolver(addSongSchema),
  });

  const addSong = useMutation({
    mutationFn: async (data: AddSongInput) => {
      const response = await api.post("/api/songs", {
        mediaUrl: data.url,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      toast.success("Song added successfully");
      handleClose();
    },
    onError: (error) => {
      console.log(error);
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          toast.error('This song already exists in your library');
        } else if (error.message.includes('download failed')) {
          toast.error('Failed to download the song. Please check the URL and try again');
        } else if (error.message.includes('unsupported URL')) {
          toast.error('This URL is not supported. Please use YouTube or SoundCloud links only');
        } else {
          toast.error('Failed to add song. Please try again later');
        }
      } else {
        toast.error('An unexpected error occurred');
      }
      handleClose();
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  const onSubmit = (data: AddSongInput) => {
    addSong.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="rounded-lg bg-black/90 backdrop-blur-lg border-purple-500/50 sm:max-w-[425px] w-[95vw] mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Music className="h-5 w-5" />
            Add New Song
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Paste a YouTube, SoundCloud, or Last.fm URL to add a song to your library
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
          <div className="space-y-3 md:space-y-4">
            <div>
              <Label htmlFor="url" className="text-sm md:text-base">Song URL</Label>
              <Input
                id="url"
                className="bg-black/20 h-12 md:h-10 text-base md:text-sm"
                {...register("url")}
                placeholder="Paste YouTube, SoundCloud, or Last.fm URL"
                type="url"
                inputMode="url"
              />
              {errors.url && (
                <p className="text-red-500 text-xs md:text-sm mt-1">
                  {errors.url.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="bg-black/20 w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addSong.isPending}
              className="bg-purple-500 hover:bg-purple-600 w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm"
            >
              {addSong.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                </>
              ) : (
                "Add Song"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
