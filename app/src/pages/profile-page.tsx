import { BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ProfileView } from '@/features/profile/view';
import { PageLayout } from '@/layout/page-layout';
import { Link } from 'react-router';

export function ProfilePage() {
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
              <BreadcrumbPage>Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        }
      >
        <ProfileView />
      </PageLayout>
    </>
  );
}
