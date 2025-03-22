import { DesktopSongsList } from "@/components/desktop/song-list";
import { MobileSongsList } from "@/components/mobile/song-list";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageLayout } from "@/layout/page-layout";
import Fetcher from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import { useAudioStore, usePlayerControls } from "@/stores/audioStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Plus } from "lucide-react";
import { Song } from "muse-shared";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router";
import { AddSongDialog } from "../add-song-dialog";

const api = Fetcher.getInstance();

type SortKey = 'title' | 'duration' | 'uploader' | 'upload_date';

const getSongs = async () => {
  const res = await api.get<Song[]>("/api/songs/youtube");
  return res.data;
};

const deleteSong = async (id: string) => {
  await api.delete(`/api/songs/${id}`);
};

export function YouTubeSongsView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [songsPerPage, setSongsPerPage] = useState(25);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: 'asc' | 'desc';
  }>({ key: 'upload_date', direction: 'desc' });

  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["songs", "youtube"], queryFn: getSongs });
  const { currentSong } = useAudioStore();

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((key: SortKey) => {
    setSortConfig(current => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
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
        song.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
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
  }, [currentPage, songsPerPage, sortedAndFilteredSongs]);

  const { playSong } = usePlayerControls();

  const removeSong = useMutation({
    mutationFn: deleteSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs", "youtube"] });
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
      <PageLayout
        breadcrumbs={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard/songs">Songs</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>YouTube</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      >
        <div className="flex flex-col flex-1 h-full">
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="md:hidden h-full overflow-y-auto">
              <div className="space-y-2">
                <MobileSongsList
                  songs={currentSongs}
                  onPlay={playSong}
                  onDelete={handleDelete}
                  currentSong={currentSong as (Song | null)}
                />
              </div>
            </div>

            <div className="hidden md:flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-auto">
                <Table>
                  <TableHeader className="bg-secondary/5 backdrop-blur-sm sticky top-0 z-10">
                    <TableRow className="border-b-0 hover:bg-transparent">
                      <TableHead className="w-[60%] lg:w-[70%] h-10">
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
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-muted-foreground hover:text-primary">
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
                                className="w-full h-7 bg-secondary/30 border-secondary/30"
                              />
                            </div>
                            <AddSongDialog>
                              <Button size="sm" className="h-7 px-3 bg-primary/20 hover:bg-primary/30">
                                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Song
                              </Button>
                            </AddSongDialog>
                          </div>
                        </div>
                      </TableHead>
                      <TableHead className="h-10 cursor-pointer group" onClick={() => handleSort('duration')}>
                        <div className="flex items-center">
                          Duration
                          <div className={cn("inline-flex flex-col ml-1 relative -top-[1px]", sortConfig.key !== 'duration' && "opacity-0 group-hover:opacity-100")}>
                            <ChevronUp className={cn("h-2.5 w-2.5", sortConfig.key === 'duration' && sortConfig.direction === 'asc' && "text-purple-500")} />
                            <ChevronDown className={cn("h-2.5 w-2.5 -mt-1", sortConfig.key === 'duration' && sortConfig.direction === 'desc' && "text-purple-500")} />
                          </div>
                        </div>
                      </TableHead>
                      <TableHead className="h-10 cursor-pointer group" onClick={() => handleSort('uploader')}>
                        <div className="flex items-center">
                          Uploader
                          <div className={cn("inline-flex flex-col ml-1 relative -top-[1px]", sortConfig.key !== 'uploader' && "opacity-0 group-hover:opacity-100")}>
                            <ChevronUp className={cn("h-2.5 w-2.5", sortConfig.key === 'uploader' && sortConfig.direction === 'asc' && "text-purple-500")} />
                            <ChevronDown className={cn("h-2.5 w-2.5 -mt-1", sortConfig.key === 'uploader' && sortConfig.direction === 'desc' && "text-purple-500")} />
                          </div>
                        </div>
                      </TableHead>
                      <TableHead className="h-10 cursor-pointer group" onClick={() => handleSort('upload_date')}>
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
      </PageLayout>
    </div>
  );
}
