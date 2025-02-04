import { Link } from "react-router";

export function Footer() {
    const footerLinks = [
        {
            title: "Product",
            links: [
                { name: "Login", href: "https://ohits.fun/login" },
                { name: "Register", href: "https://ohits.fun/register" },
                { name: "API Docs", href: "https://museisfun.fly.dev" },
            ]
        },
        {
            title: "Social",
            links: [
                { name: "GitHub Repo", href: "https://github.com/nyumat/muse" },
                { name: "My GitHub", href: "https://github.com/nyumat" },
                { name: "My Website", href: "https://tomnyuma.rocks" },
            ]
        }
    ];

    return (
        <footer className="w-full bg-background border-t">
            <div className="mx-auto max-w-screen-xl px-4 pb-8 pt-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-24 lg:grid-cols-3">
                    {/* Logo and Description Section */}
                    <div>
                        <Link to="/" title="Muse Logo" className="inline-block">
                            <div className="flex aspect-auto size-20 items-center justify-center rounded-lg hover:bg-muted transition-colors">
                                <div className="text-left text-sm leading-tight">
                                    <img
                                        src="/logo.svg"
                                        alt="logo"
                                        className="dark:hidden w-full h-full object-contain"
                                    />
                                    <img
                                        src="/logo-color.svg"
                                        alt="muse logo"
                                        className="hidden dark:block w-full h-full object-contain"
                                    />
                                </div>
                            </div>
                        </Link>

                        <p className="mt-4 max-w-sm text-sm text-muted-foreground">
                            Download and stream the songs and playlists you love for free.
                            Enjoy music the way it always should've been.
                        </p>

                    </div>

                    {/* Links Sections */}
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-2">
                        {footerLinks.map((section) => (
                            <div key={section.title}>
                                <p className="font-medium text-primary">{section.title}</p>

                                <ul className="mt-6 space-y-4 text-sm">
                                    {section.links.map((link) => (
                                        <li key={link.name}>
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-muted-foreground transition hover:text-primary"
                                            >
                                                {link.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 border-t pt-8">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                            &copy; {new Date().getFullYear()} Muse. All rights reserved.
                        </p>

                        <ul className="mt-4 flex flex-wrap gap-4 text-xs sm:mt-0">
                            <li>
                                <a href="#" className="text-muted-foreground transition hover:text-primary">
                                    Terms & Conditions
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground transition hover:text-primary">
                                    Privacy Policy
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}