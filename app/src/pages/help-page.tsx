import { BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { HelpView } from '@/features/help/view';
import { PageLayout } from '@/layout/page-layout';
import { Link } from 'react-router';

export function HelpPage() {
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
              <BreadcrumbPage>Help</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        }
      >
        <HelpView />
      </PageLayout>
    </>
  );
}