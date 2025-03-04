import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GridIllustration } from '@/components/ui/grid-bg';
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PiGithubLogo, PiSoundcloudLogo, PiYoutubeLogo } from 'react-icons/pi';
import { Link } from "react-router";
import { Mockup } from './mockup';

/**
 * TODO: Add feature flags
 * @example
 * type FeatureFlag = "mockup" | "marquee" | "desktop-feats" | "comparison";
 *
 */

export function HeroSection() {
    const { data: user } = useUser();
    const isMobile = useIsMobile();
    return (
        <>
            <section className="bg-background relative overflow-hidden md:pt-24 lg:pt-20 2xl:pt-24">
                <div className="absolute inset-0 opacity-30">
                    {[...Array(20)].map((_, i) => {
                        const colors = [
                            "text-red-500",
                            "text-blue-500",
                            "text-green-500",
                            "text-yellow-500",
                            "text-purple-500",
                            "text-pink-500"
                        ];
                        return (
                            <motion.div
                                key={i}
                                className={`absolute text-2xl ${colors[Math.floor(Math.random() * colors.length)]}`}
                                initial={{ y: "100vh", x: Math.random() * 100 + "vw", opacity: 0 }}
                                animate={{
                                    y: "-10vh",
                                    x: Math.random() * 100 + "vw",
                                    opacity: 1,
                                    rotate: Math.random() * 10
                                }}
                                transition={{
                                    duration: Math.random() * 10 + 15,
                                    repeat: Infinity,
                                    delay: Math.random() * 5,
                                    ease: "linear"
                                }}
                            >
                                ♪
                            </motion.div>
                        );
                    })}
                </div>
                <div className="container mx-auto px-4 pt-12 pb-32 md:pt-0 lg:pt-0 xl:pt-0 md:pb-48">
                    <div className="flex flex-col xl:flex-row xl:items-start gap-12 items-center">
                        <div className="flex-1 space-y-6 md:space-y-8 text-center xl:text-left">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: 0.2,
                                    ease: [0.23, 1, 0.32, 1]
                                }}
                                className="flex flex-wrap xl:justify-start justify-center gap-2 mb-4"
                            >
                                <Badge variant="outline" className="text-xs sm:text-sm font-medium tracking-tight py-1 px-2 hover:bg-primary/10 transition-colors cursor-default mt-12 md:mt-8 group/badge z-50">
                                    <span className="mr-1">💸</span>
                                    <a
                                        title="Donate to keep Muse free for everyone"
                                        className="group-hover/badge:text-primary transition-colors group-hover/badge:underline decoration-white/20 hover:decoration-white/40 group-hover/badge:cursor-pointer"
                                        href="https://buymeacoffee.com/nyumat"
                                        target="_blank"
                                    >Donate to keep Muse free for everyone</a>
                                    <span className="ml-1">💸</span>
                                </Badge>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.7,
                                    delay: 0.2,
                                    ease: [0.23, 1, 0.32, 1]
                                }}
                                className="space-y-4"
                            >
                                {isMobile ? (
                                    <h1 className="text-2xl font-semibold tracking-tight leading-tight">
                                        Stream music freely <br />
                                        <span className="text-transparent bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text animate-gradient">
                                            {" "}without any of the fees
                                        </span>
                                    </h1>
                                ) : (
                                    <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
                                        Download and stream{" "}
                                        <br />
                                        <span className="text-transparent bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text animate-gradient">
                                            songs you love
                                        </span>
                                        {" "}for free.
                                    </h1>
                                )}

                                <p className={cn(
                                    "text-muted-foreground max-w-xl xl:mx-0 mx-auto text-sm lg:text-lg 2xl:text-xl",
                                    isMobile ? "max-w-xs" : "max-w-xl"
                                )}>
                                    {isMobile ? (
                                        <>
                                            Muse is an open source music streaming repository for <i className='underline'><b>ALL</b></i> your personal needs.
                                        </>
                                    ) : (
                                        <>
                                            Wow, you're finally home. <br />Welcome to music streaming that's built for you, by you.
                                        </>
                                    )}
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.7,
                                    delay: 0.4,
                                    ease: [0.23, 1, 0.32, 1]
                                }}
                                className="flex flex-wrap justify-center xl:justify-start gap-3 text-xs sm:text-sm max-w-xs mx-auto xl:ml-0"
                            >
                                <div className='flex items-center gap-1.5 text-muted-foreground'>
                                    <PiYoutubeLogo className="size-4 text-red-500 mr-1" />
                                    <span>YouTube Support</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <svg className="size-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>No Tracking</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <PiSoundcloudLogo className="size-4 text-orange-500 mr-1" />
                                    <span>Soundcloud Support</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <svg className="size-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>No Ads</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <PiGithubLogo className="size-4 text-white mr-1" />
                                    <span>Open Source</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <svg className="size-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Host Your Own</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="hidden sm:flex items-center justify-center gap-1.5 text-muted-foreground z-10">
                                    <span className="inline-flex items-center">Made by<Link to="https://github.com/nyumat" target="_blank" className="text-primary hover:underline font-light ml-1"><b>@nyumat</b></Link></span>
                                    <span className="text-xl ml-2">·</span>
                                    <span className="text-xl">·</span>
                                    <span className="text-xl mr-2">·</span>
                                    <Link to="/about" className="text-primary hover:underline font-light ml-1 inline-flex items-center">
                                        <span className="inline-flex items-center"><span className="dark:text-muted-foreground">Learn more</span>
                                            <ArrowRight className="size-4 sm:size-5 ml-1 group-hover/arrow:translate-x-1 transition-transform relative z-10" /></span>
                                    </Link>
                                </div>
                            </motion.div>

                            <div className="flex flex-col xl:items-start items-center gap-3">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.7,
                                        delay: 0.6,
                                        ease: [0.23, 1, 0.32, 1]
                                    }}
                                    className="flex flex-col sm:flex-row xl:justify-start justify-center gap-3 pt-0 relative z-20 w-full"
                                >
                                    <Link
                                        to={user ? "/dashboard" : "/register"}
                                        className={cn(
                                            "relative h-10 px-4 overflow-hidden",
                                            "bg-zinc-900 dark:bg-purple-900",
                                            "transition-all duration-200",
                                            "group",
                                            "w-full sm:w-auto font-normal rounded-md",
                                            "flex items-center justify-center"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute inset-0",
                                            "bg-gradient-to-r from-indigo-400 via-primary to-primary",
                                            "opacity-40 group-hover:opacity-80",
                                            "blur transition-opacity duration-500"
                                        )} />
                                        <div className="relative flex items-center justify-center gap-2">
                                            <span className="text-white dark:text-white text-center">Get Started Free</span>
                                            <ArrowRight className="w-3.5 h-3.5 text-white/90 dark:text-white/90 group-hover:translate-x-1 group-hover:rotate-[360deg] transition-all duration-300 ease-in-out" />
                                        </div>
                                    </Link>

                                    <Button
                                        asChild
                                        variant="secondary"
                                        className="w-full sm:w-auto font-normal group/github"
                                    >
                                        <Link to="https://github.com/nyumat/muse" target="_blank">
                                            <span className="group-hover/github:text-primary transition-colors">View Source</span>
                                        </Link>
                                    </Button>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.7,
                                        delay: 0.8,
                                        ease: [0.23, 1, 0.32, 1]
                                    }}
                                    className="flex flex-col sm:flex-row xl:justify-start justify-center gap-3 pt-0 relative z-20 w-full"
                                >
                                    <Button asChild variant="link" className="w-full sm:w-auto xl:hidden z-50">
                                        <Link to="/about">Learn more</Link>
                                    </Button>
                                </motion.div>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.7,
                                    delay: 0.6,
                                    ease: [0.23, 1, 0.32, 1]
                                }}
                                className="hidden xl:block mt-12"
                            >
                                <div className="rounded-lg border border-border/50 backdrop-blur-sm bg-background/50 w-[600px]">
                                    <div className="p-3 space-y-2.5 text-sm font-light">
                                        <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                                            <span className="font-medium">Features</span>
                                            <div className="flex items-center gap-12">
                                                <span className="font-medium text-primary w-12 text-center">Muse</span>
                                                <span className="font-medium text-muted-foreground w-16 text-center">YouTube</span>
                                                <span className="font-medium text-muted-foreground w-16 text-center">Spotify</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Price</span>
                                            <div className="flex items-center gap-12">
                                                <span className="text-emerald-500 w-12 text-center">Free</span>
                                                <span className="text-red-500 w-16 text-center">$11.99/mo</span>
                                                <span className="text-red-500 w-16 text-center">$9.99/mo</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Downloads</span>
                                            <div className="flex items-center gap-12">
                                                <span className="text-emerald-500 w-12 text-center">✓</span>
                                                <span className="text-red-500 w-16 text-center">Premium</span>
                                                <span className="text-red-500 w-16 text-center">Premium</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Ad-free</span>
                                            <div className="flex items-center gap-12">
                                                <span className="text-emerald-500 w-12 text-center">✓</span>
                                                <span className="text-red-500 w-16 text-center">Premium</span>
                                                <span className="text-red-500 w-16 text-center">Premium</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Usage Analytics</span>
                                            <div className="flex items-center gap-12">
                                                <span className="text-emerald-500 w-12 text-center">✓</span>
                                                <span className="text-red-500 w-16 text-center">✗</span>
                                                <span className="text-emerald-500 w-16 text-center">✓</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-border/50 pt-2.5">
                                            <span className="text-muted-foreground">Self-hostable</span>
                                            <div className="flex items-center gap-12">
                                                <span className="text-emerald-500 w-12 text-center">✓</span>
                                                <span className="text-red-500 w-16 text-center">✗</span>
                                                <span className="text-red-500 w-16 text-center">✗</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="w-full xl:w-[45%]">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.8,
                                    delay: 0.8,
                                    ease: [0.23, 1, 0.32, 1]
                                }}
                                className="relative md:mt-8 z-10"
                            >
                                <div className="lg:hidden w-full max-w-3xl mx-auto">
                                    <div className="overflow-x-auto -mx-4 px-4">
                                        <Table className="border rounded-lg overflow-hidden shadow-sm">
                                            <TableHeader>
                                                <TableRow className="bg-primary/5">
                                                    <TableHead className="w-1/4 font-semibold"></TableHead>
                                                    <TableHead className="w-1/4 text-primary font-semibold">Muse</TableHead>
                                                    <TableHead className="w-1/4 font-semibold">Spotify</TableHead>
                                                    <TableHead className="w-1/4 font-semibold">Apple M.</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow className="hover:bg-muted/50 transition-colors">
                                                    <TableCell className="font-medium">Price</TableCell>
                                                    <TableCell className="text-emerald-500 font-medium">Free</TableCell>
                                                    <TableCell className="text-red-500">$9.99/mo</TableCell>
                                                    <TableCell className="text-red-500">$10.99/mo</TableCell>
                                                </TableRow>
                                                <TableRow className="hover:bg-muted/50 transition-colors">
                                                    <TableCell className="font-medium">Downloads</TableCell>
                                                    <TableCell className="text-emerald-500 font-medium">✓</TableCell>
                                                    <TableCell className="text-red-500">Premium Only</TableCell>
                                                    <TableCell className="text-red-500">Premium Only</TableCell>
                                                </TableRow>
                                                <TableRow className="hover:bg-muted/50 transition-colors">
                                                    <TableCell className="font-medium">Ad-free</TableCell>
                                                    <TableCell className="text-emerald-500 font-medium">✓</TableCell>
                                                    <TableCell className="text-red-500">Premium Only</TableCell>
                                                    <TableCell className="text-red-500">Premium Only</TableCell>
                                                </TableRow>
                                                <TableRow className="hover:bg-muted/50 transition-colors">
                                                    <TableCell className="font-medium">Self-hostable</TableCell>
                                                    <TableCell className="text-emerald-500 font-medium">✓</TableCell>
                                                    <TableCell className="text-red-500">✗</TableCell>
                                                    <TableCell className="text-red-500">✗</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                                <Mockup />
                            </motion.div>
                            <div className="absolute inset-0 opacity-30 rotate-180">
                                <GridIllustration />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
