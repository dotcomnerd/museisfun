import { BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ProfileViewNested, UserProfile } from '@/features/profile/nested';
import { PageLayout } from '@/layout/page-layout';
import Fetcher from '@/lib/fetcher';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';


export function PublicProfilePage() {
  const api = Fetcher.getInstance();
  const { username } = useParams<{ username: string }>();
  const { data: user, isLoading } = useQuery({
    queryKey: ["user-profile", username],
    queryFn: async () => {
      const { data } = await api.get<UserProfile>(`/users/${username}`);
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
                <Link to="/dashboard/profile">Profile</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {isLoading ? "Loading..." : `${user?.username}`}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        }
      >
        <ProfileViewNested userData={user} isLoading={isLoading} />
      </PageLayout>
    </>
  );
}