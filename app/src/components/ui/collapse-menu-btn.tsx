import { ChevronDown, Dot, LucideIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Submenu } from "@/layout/static/menu-list";
import { cn } from "@/lib/utils";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import { Link } from "react-router";

interface CollapseMenuButtonProps {
    icon: LucideIcon;
    label: string;
    active: boolean;
    submenus: Submenu[];
    isOpen: boolean | undefined;
}

export function CollapseMenuButton({
    icon: MenuIcon,
    label,
    active,
    submenus,
    isOpen,
}: CollapseMenuButtonProps) {
    const isSubmenuActive = submenus.some((submenu) => submenu.active);
    const parentActive = active || isSubmenuActive;
    const [isCollapsed, setIsCollapsed] = useState<boolean>(isSubmenuActive);

    return isOpen ? (
        <Collapsible
            open={isCollapsed}
            onOpenChange={setIsCollapsed}
            className="w-full"
        >
            <CollapsibleTrigger
                className="mb-1 [&[data-state=open]>div>div>svg]:rotate-180"
                asChild
            >
                <Button
                    variant={parentActive ? "link" : "ghost"}
                    className={cn("h-10 w-full justify-start")}
                >
                    <div className="flex w-full items-center justify-between">
                        <div className="flex items-center">
                            <span className="mr-4">
                                <MenuIcon size={18} />
                            </span>
                            <p
                                className={cn(
                                    "max-w-[150px] truncate",
                                    isOpen
                                        ? "translate-x-0 opacity-100"
                                        : "-translate-x-96 opacity-0"
                                )}
                            >
                                {label}
                            </p>
                        </div>
                        <div
                            className={cn(
                                "whitespace-nowrap",
                                isOpen
                                    ? "translate-x-0 opacity-100"
                                    : "-translate-x-96 opacity-0"
                            )}
                        >
                            <ChevronDown
                                size={18}
                                className="transition-transform duration-200"
                            />
                        </div>
                    </div>
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
                {submenus.map(({ href, label, active, icon: SubMenuIcon }, index) => (
                    <Button
                        key={index}
                        variant={active ? "link" : "ghost"}
                        className={cn("mb-1 h-10 w-full justify-start")}
                        asChild
                    >
                        <Link to={href}>
                            <span className="ml-6 mr-2">
                                {SubMenuIcon ? (
                                    <SubMenuIcon size={16} />
                                ) : (
                                    <Dot size={18} />
                                )}
                            </span>
                            <p
                                className={cn(
                                    "max-w-[170px] truncate",
                                    isOpen
                                        ? "translate-x-0 opacity-100"
                                        : "-translate-x-96 opacity-0"
                                )}
                            >
                                {label}
                            </p>
                        </Link>
                    </Button>
                ))}
            </CollapsibleContent>
        </Collapsible>
    ) : (
        <DropdownMenu>
            <TooltipProvider disableHoverableContent>
                <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant={parentActive ? "link" : "ghost"}
                                className={cn("mb-1 h-10 w-full justify-start")}
                            >
                                <div className="flex w-full items-center justify-between">
                                    <div className="flex items-center">
                                        <span className={cn(isOpen === false ? "" : "mr-4")}>
                                            <MenuIcon size={18} />
                                        </span>
                                        <p
                                            className={cn(
                                                "max-w-[200px] truncate",
                                                isOpen === false ? "opacity-0" : "opacity-100"
                                            )}
                                        >
                                            {label}
                                        </p>
                                    </div>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="start" alignOffset={2}>
                        {label}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent side="right" sideOffset={25} align="start" onCloseAutoFocus={(e) => e.preventDefault()}>
                <DropdownMenuLabel className="max-w-[190px] truncate">
                    {label}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {submenus.map(({ href, label, active }, index) => (
                    <DropdownMenuItem key={index} asChild>
                        <Link
                            className={cn(active ? "text-primary hover:text-primary/80 transition-colors bg-secondary" : "", "cursor-pointer")}
                            to={href}
                        >
                            <p className="max-w-[180px] truncate">{label}</p>
                        </Link>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuArrow className="fill-border" />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}