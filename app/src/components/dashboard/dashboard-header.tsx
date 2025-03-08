import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { SheetMenu } from '@/layout/static/muse-nav';
import { useSidebarToggle } from '@/hooks/use-sidebar-toggle';
import { useStore } from 'zustand';

interface DashboardHeaderProps {
  currentPage?: string;
}

export function DashboardHeader({ currentPage = 'Home' }: DashboardHeaderProps) {
  const sidebar = useStore(useSidebarToggle, (state) => state);

  return (
    <header className="sticky top-0 z-10 h-14 md:h-16 border-b border-border/40 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <div className="container h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:text-primary"
                onClick={() => sidebar?.setIsOpen()}
              >
                ⌘ U
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Toggle Sidebar
            </TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentPage}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <SheetMenu />
      </div>
    </header>
  );
}
