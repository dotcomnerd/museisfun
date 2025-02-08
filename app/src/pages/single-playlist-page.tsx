import { BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { PlaylistViewNested } from '@/features/playlists/nested';
import { PageLayout } from '@/layout/page-layout';
import Fetcher from '@/lib/fetcher';
import { Playlist } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'lucide-react';
import { useParams } from 'react-router';

export function SinglePlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const api = Fetcher.getInstance();
  const { data: playlist } = useQuery({
    queryKey: ["playlist", id],
    queryFn: async () => {
      const { data } = await api.get<Playlist>(`/api/playlists/${id}`);
      return data;
    },
  });
  return (
    <>
      <PageLayout
        breadcrumbs={
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard/playlists">Playlists</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{playlist?.name ?? "Playlist"}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        }
      >
        <PlaylistViewNested />
      </PageLayout>
    </>
  );
}