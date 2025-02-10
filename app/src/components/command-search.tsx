import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/use-debounce";
import Fetcher from '@/lib/fetcher';
import * as React from "react";
import { useCallback, useState } from "react";
import { LoadingSpinner } from './ui/video-components';

interface YouTubeVideo {
  title: string;
  thumbnail: string;
  watchUrl: string;
}

interface CommandSearchProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandSearch({ trigger, open: controlledOpen, onOpenChange }: CommandSearchProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debouncedQuery = useDebounce(query, 300);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "." && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const searchYouTube = useCallback(async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const api = Fetcher.getInstance();
      await api.get("/api/youtube/search", {
        params: {
          q: searchQuery,
          limit: 10,
        },
      }).then((response) => {
        setResults(response.data);
        setSelectedIndex(0);
      }).catch((error) => {
        console.error("Failed to search YouTube:", error);
        setResults([]);
      }).finally(() => {
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Failed to search YouTube:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    searchYouTube(debouncedQuery);
  }, [debouncedQuery, searchYouTube]);

  const handleSelect = useCallback(async (video: YouTubeVideo) => {
    try {
      const api = Fetcher.getInstance();
      api.post("/api/songs", {
        mediaUrl: video.watchUrl,
      });
      setOpen(false);
    } catch (error) {
      console.error("Failed to process video:", error);
    }
  }, [setOpen]);

  return (
    <>
      {trigger}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search YouTube videos..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="h-[800px]">
          <CommandEmpty>
            {isLoading && (
              <LoadingSpinner isLoading={true} />
            )}

            {!isLoading && <>
              {results.length === 0 && (
                <p>No results found.</p>
              )}
            </>}
          </CommandEmpty>
          {results.length > 0 && (
            <CommandGroup>
              <div className="flex h-full">
                {/* Left column - Scrollable list */}
                <div className="w-1/2 border-r pr-4">
                  <div className="space-y-2">
                    {results.map((video, index) => (
                      <CommandItem
                        key={video.watchUrl}
                        value={video.title}
                        onSelect={() => handleSelect(video)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`flex items-center gap-2 cursor-pointer hover:bg-accent ${
                          selectedIndex === index ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 text-sm text-left w-full">
                          <span className="text-muted-foreground w-4">{index + 1}</span>
                          <span className="max-w-full truncate">{video.title}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </div>
                </div>

                {/* Right column - Video details */}
                <div className="w-1/2 pl-4 flex items-center">
                  {results[selectedIndex] && (
                    <div className="space-y-6 w-full">
                      <img
                        src={results[selectedIndex].thumbnail}
                        alt={results[selectedIndex].title}
                        className="w-full aspect-video object-cover rounded-lg shadow-md"
                      />
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg leading-tight">{results[selectedIndex].title}</h3>
                        <button
                          onClick={() => handleSelect(results[selectedIndex])}
                          className="w-full px-4 py-3 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
                        >
                          Add to Library
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
