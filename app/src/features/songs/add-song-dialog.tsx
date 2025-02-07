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
      <DialogContent className="bg-background/80 backdrop-blur-lg border-primary/30 rounded-lg sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Add New Song
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/70">
            Paste a YouTube, SoundCloud, or Last.fm URL to add a song to your library
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div>
              <Label htmlFor="url">Song URL</Label>
              <Input
                id="url"
                className="bg-secondary/10 border-secondary/20 text-foreground/90 placeholder:text-muted-foreground/50 focus-visible:ring-ring/50 focus-visible:border-ring/30 h-8"
                {...register("url")}
                placeholder="Paste YouTube, SoundCloud, or Last.fm URL"
                type="url"
                inputMode="url"
              />
              {errors.url && (
                <p className="text-destructive/90 text-xs mt-1">
                  {errors.url.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="h-8 hover:bg-secondary/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addSong.isPending}
              className="bg-primary/80 hover:bg-primary/70 text-primary-foreground/90 h-8"
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
