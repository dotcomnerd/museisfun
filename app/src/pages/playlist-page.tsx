import { BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { PlaylistView } from '@/features/playlists/view';
import { PageLayout } from '@/layout/page-layout';
import { Link } from 'lucide-react';

export function PlaylistsPage() {
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
              <BreadcrumbPage>Playlists</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        }
      >
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold dark:text-gray-200 text-gray-700">
            Your Playlists
          </h1>
        </div>
        <PlaylistView />
      </PageLayout>
    </>
  );
}
