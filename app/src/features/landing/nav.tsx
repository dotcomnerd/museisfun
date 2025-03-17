import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    NavigationMenu, NavigationMenuLink,
    NavigationMenuList, navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { useUserStore } from '@/stores/userStore';
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Settings, User } from "lucide-react";
import { ComponentPropsWithoutRef, ReactNode, forwardRef } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

/**
 * Navigation menu item component
 *
 * @param href - The URL to navigate to
 * @param children - The content to display inside the navigation menu item
 */
const NavItem = ({
    href,
    children,
}: {
    href: string;
    children: ReactNode;
}) => (
    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
        <Link to={href}>{children}</Link>
    </NavigationMenuLink>
);

/**
 * List item component for navigation menu
 *
 * @param className - Additional CSS classes for styling
 * @param title - The title of the list item
 * @param children - The content to display inside the list item
 */
const ListItem = forwardRef<
    HTMLAnchorElement,
    ComponentPropsWithoutRef<"a"> & { title: string; href: string }
>(({ className, title, children, href, ...props }, ref) => (
    <li ref={ref as unknown as React.RefObject<HTMLLIElement>}>
        <NavigationMenuLink asChild>
            <Link
                to={href}
                className={cn(
                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary/10 hover:text-foreground focus:bg-primary/10 focus:text-foreground",
                    className
                )}
                {...props}
            >
                <div className="text-sm font-medium leading-none">{title}</div>
                <p className="line-clamp-2 text-sm leading-snug text-foreground/80">
                    {children}
                </p>
            </Link>
        </NavigationMenuLink>
    </li>
));
ListItem.displayName = "ListItem";

/**
 * Navigation bar component
 *
 * @returns The navigation bar component (landing page)
 */
export const Navbar = () => {
    const { data: user, isLoading, isError } = useUser();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const handleLogout = async () => {
        useUserStore.getState().clearUser();
        queryClient.removeQueries({ queryKey: ['use-user'] });
        localStorage.removeItem("token");
        toast.success("Logged out successfully");
        navigate("/");
    };

    if (isError) {
        return null;
    }

    return (
        <header className="fixed left-0 right-0 top-0 z-50 p-4 transition-all duration-300 ease-in-out backdrop-blur-md bg-background/80">
            <div className="mx-auto max-w-6xl">
                <nav className="rounded-2xl border border-border bg-background/20 px-6 transition-all duration-300 ease-in-out">
                    <div className="flex h-12 items-center justify-between">
                        <div className="flex items-center">
                            <Link to="/" className="flex flex-shrink-0 items-center">
                                <div className="text-2xl font-bold">Muse</div>
                            </Link>
                            <nav className="ml-4 hidden md:block">
                                <NavigationMenu>
                                    <NavigationMenuList className="text-foreground/80">
                                        <NavItem href="/about">About</NavItem>
                                        {!isLoading && user && (
                                            <>
                                                <NavItem href="/dashboard">Dashboard</NavItem>
                                                <NavItem href="/dashboard/songs">Library</NavItem>
                                                <NavItem href="/dashboard/playlists">Playlists</NavItem>
                                            </>
                                        )}
                                        {!isLoading && !user && (
                                            <>
                                                <NavItem href="/login">Login</NavItem>
                                                <NavItem href="/register">Register</NavItem>
                                            </>
                                        )}
                                        <NavItem href="https://api.museisfun.com">API</NavItem>
                                        <NavItem href="https://docs.museisfun.com">Docs</NavItem>
                                    </NavigationMenuList>
                                </NavigationMenu>
                            </nav>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="[&>button]:border-0 [&>button]:bg-transparent [&>button]:shadow-none">
                                <ModeToggle />
                            </div>
                            {!isLoading && user && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="focus:outline-none">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                            <AvatarImage src={user.pfp} />
                                        </Avatar>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>@{user.username} on Muse</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                                            <User className="mr-2 h-4 w-4" />
                                            Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                                            <Settings className="mr-2 h-4 w-4" />
                                            Settings
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
};
