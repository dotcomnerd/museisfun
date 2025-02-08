import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { GridIllustration } from '@/components/ui/grid-bg';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PiSoundcloudLogoFill } from "react-icons/pi";
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
    return (
        <>
            <section className="bg-background relative overflow-hidden md:pt-24">
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
                                <Badge variant="outline" className="text-xs py-1 px-2 hover:bg-primary/10 transition-colors cursor-default">
                                    <PiSoundcloudLogoFill className="w-3 h-3 text-primary mr-1" />
                                    <span>Soundcloud Support</span>
                                </Badge>
                                <Badge variant="outline" className="text-xs py-1 px-2 hover:bg-primary/10 transition-colors cursor-default">
                                    <span className="mr-1">🔓</span>
                                    <span>Open Source</span>
                                </Badge>
                                <Badge variant="outline" className="text-xs py-1 px-2 hover:bg-primary/10 transition-colors cursor-default">
                                    <span className="mr-1">⚡</span>
                                    <span>Self-hostable</span>
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
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
                                    Download and stream<br />
                                    <span className="text-transparent bg-gradient-to-r from-[#D247BF] via-primary to-[#47D2D2] bg-clip-text animate-gradient">
                                        songs you love
                                    </span>
                                    <br />
                                    for free.
                                </h1>
                                <p className="text-muted-foreground text-sm sm:text-lg max-w-xl xl:mx-0 mx-auto">
                                    Enjoy music the way it always should've been—offline, ad-free, and always free to use.
                                    Host it yourself or use our cloud version, the choice is yours.
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
                                className="flex flex-wrap xl:justify-start justify-center gap-3 text-xs sm:text-sm"
                            >
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>No Ads</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span>Privacy First</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>Lightning Fast</span>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.7,
                                    delay: 0.6,
                                    ease: [0.23, 1, 0.32, 1]
                                }}
                                className="flex flex-col sm:flex-row xl:justify-start justify-center gap-3 pt-4 relative z-20"
                            >
                                <Link
                                    to={user ? "/dashboard" : "/register"}
                                    className={cn(
                                        buttonVariants({ variant: "default" }),
                                        "w-full sm:w-auto font-bold group/arrow relative overflow-hidden"
                                    )}
                                >
                                    <span className="relative z-10">Get Started Free</span>
                                    <ArrowRight className="size-4 sm:size-5 ml-2 group-hover/arrow:translate-x-1 transition-transform relative z-10" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-[#D247BF] to-primary opacity-0 group-hover/arrow:opacity-100 transition-opacity" />
                                </Link>

                                <Button
                                    asChild
                                    variant="secondary"
                                    className="w-full sm:w-auto font-bold group/github"
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
                                    delay: 0.6,
                                    ease: [0.23, 1, 0.32, 1]
                                }}
                                className="hidden xl:block mt-12"
                            >
                                <div className="rounded-lg border border-border/50 backdrop-blur-sm bg-background/50 w-[400px]">
                                    <div className="p-3 space-y-2.5 text-sm font-light">
                                        <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                                            <span className="font-medium">Features</span>
                                            <div className="flex items-center gap-8">
                                                <span className="font-medium text-primary">Muse</span>
                                                <span className="font-medium text-muted-foreground">Others</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Price</span>
                                            <div className="flex items-center gap-8">
                                                <span className="text-emerald-500">Free</span>
                                                <span className="text-red-500">$9.99/mo</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Offline Mode</span>
                                            <div className="flex items-center gap-8">
                                                <span className="text-emerald-500">✓</span>
                                                <span className="text-red-500">Premium</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Ad-free</span>
                                            <div className="flex items-center gap-8">
                                                <span className="text-emerald-500">✓</span>
                                                <span className="text-red-500">Premium</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Custom Uploads</span>
                                            <div className="flex items-center gap-8">
                                                <span className="text-emerald-500">✓</span>
                                                <span className="text-red-500">✗</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-border/50 pt-2.5">
                                            <span className="text-muted-foreground">Self-hostable</span>
                                            <div className="flex items-center gap-8">
                                                <span className="text-emerald-500">✓</span>
                                                <span className="text-red-500">✗</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="w-full xl:w-[55%]">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.8,
                                    delay: 0.8,
                                    ease: [0.23, 1, 0.32, 1]
                                }}
                                className="relative mt-8 z-10"
                            >
                                <div className="lg:hidden w-full max-w-3xl mx-auto">
                                    <div className="overflow-x-auto -mx-4 px-4">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-1/4">Features</TableHead>
                                                    <TableHead className="w-1/4">Muse</TableHead>
                                                    <TableHead className="w-1/4">YouTube Music</TableHead>
                                                    <TableHead className="w-1/4">SoundCloud</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>Price</TableCell>
                                                    <TableCell className="text-emerald-500">Free</TableCell>
                                                    <TableCell className="text-red-500">$9.99/mo</TableCell>
                                                    <TableCell className="text-red-500">$9.99/mo</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Offline Mode</TableCell>
                                                    <TableCell className="text-emerald-500">✓</TableCell>
                                                    <TableCell className="text-red-500">Premium Only</TableCell>
                                                    <TableCell className="text-red-500">Premium Only</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Ad-free</TableCell>
                                                    <TableCell className="text-emerald-500">✓</TableCell>
                                                    <TableCell className="text-red-500">Premium Only</TableCell>
                                                    <TableCell className="text-red-500">Premium Only</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Self-hostable</TableCell>
                                                    <TableCell className="text-emerald-500">✓</TableCell>
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
