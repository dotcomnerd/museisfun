import {
    Heart,
    HeartIcon,
    HelpCircle,
    LucideIcon,
    Settings2Icon,
    Shield,
    Volume2,
    User,
    UserCog,
    Search,
} from "lucide-react";
import { IconType } from "react-icons/lib";
import { PiHouse, PiList, PiMusicNote, PiPlaylist, PiSoundcloudLogo, PiYoutubeLogoLight } from "react-icons/pi";

export type Submenu = {
    href: string;
    label: string;
    active: boolean;
    icon?: LucideIcon | IconType;
};

type Menu = {
    href: string;
    label: string;
    active: boolean;
    icon: LucideIcon | IconType;
    submenus: Submenu[];
};

type Group = {
    groupLabel: string;
    menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
    return [
        {
            groupLabel: "",
            menus: [
                {
                    href: "#",
                    label: "Search",
                    active: false,
                    icon: Search,
                    submenus: [],
                },
                {
                    href: "/dashboard",
                    label: "Home",
                    active: pathname === "/dashboard",
                    icon: PiHouse,
                    submenus: [],
                },
            ],
        },
        {
            groupLabel: "Your Catalog",
            menus: [
                {
                    href: "/songs",
                    label: "Songs",
                    active: pathname.includes("/dashboard/songs"),
                    icon: PiMusicNote,
                    submenus: [
                        {
                            href: "/dashboard/songs",
                            label: "All Songs",
                            icon: PiList,
                            active: pathname === "/dashboard/songs" && !pathname.includes("/youtube") && !pathname.includes("/soundcloud"),
                        },
                        {
                            href: "/dashboard/songs/youtube",
                            label: "YouTube",
                            icon: PiYoutubeLogoLight,
                            active: pathname === "/dashboard/songs/youtube",
                        },
                        {
                            href: "/dashboard/songs/soundcloud",
                            label: "SoundCloud",
                            icon: PiSoundcloudLogo,
                            active: pathname === "/dashboard/songs/soundcloud",
                        },
                    ],
                },
                {
                    href: "/dashboard/playlists",
                    label: "Playlists",
                    active: pathname.includes("/playlists"),
                    icon: PiPlaylist,
                    submenus: [],
                },
                {
                    href: "/dashboard/favorites",
                    label: "Favorites",
                    active: pathname.includes("/favorites"),
                    icon: Heart,
                    submenus: [],
                },
            ],
        },
        {
            groupLabel: "Account",
            menus: [
                {
                    href: "/dashboard/settings",
                    label: "Settings",
                    active: pathname.includes("/settings") || window?.location?.hash?.startsWith("#"),
                    icon: Settings2Icon,
                    submenus: [
                        {
                            href: "/dashboard/settings#privacy",
                            label: "Privacy",
                            icon: Shield,
                            active: pathname.includes("/settings") && window?.location?.hash === "#privacy",
                        },
                        {
                            href: "/dashboard/settings#preferences",
                            label: "Preferences",
                            icon: HeartIcon,
                            active: pathname.includes("/settings") && window?.location?.hash === "#preferences",
                        },
                        {
                            href: "/dashboard/settings#playback",
                            label: "Playback",
                            icon: Volume2,
                            active: pathname.includes("/settings") && window?.location?.hash === "#playback",
                        },
                        {
                            href: "/dashboard/settings#account",
                            label: "Account",
                            icon: User,
                            active: pathname.includes("/settings") && window?.location?.hash === "#account",
                        },
                    ],
                },
                {
                    href: "/dashboard/profile",
                    label: "Profile",
                    active: pathname.includes("/profile"),
                    icon: UserCog,
                    submenus: [],
                },
                {
                    href: "/dashboard/help",
                    label: "Need Help?",
                    active: pathname.includes("/help"),
                    icon: HelpCircle,
                    submenus: [],
                },
            ],
        },
    ];
}