import { BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { SettingsView } from '@/features/settings/view';
import { PageLayout } from '@/layout/page-layout';
import { Link } from 'react-router';

export function SettingsPage() {
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
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        }
      >
        <SettingsView />
      </PageLayout>
    </>
  );
}