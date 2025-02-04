import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PiSoundcloudLogoFill } from "react-icons/pi";
import { Link } from "react-router";

export function HeroSection() {
    const { data: user } = useUser();

    return (
        <>
            <section className="bg-background relative">
                <div className="container mx-auto px-4 pt-12 md:pt-16 space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.5,
                            delay: 0.8,
                            ease: [0.23, 1, 0.32, 1]
                        }}
                        className="flex items-center justify-center gap-4"
                    >
                        <Badge variant="outline" className="text-sm py-2">
                            <span className="mr-2 text-primary">
                                <Badge>New</Badge>
                            </span>
                            <span>Support for Soundcloud</span>
                            <PiSoundcloudLogoFill className="ml-2 w-6 h-6 text-primary" />
                        </Badge>
                    </motion.div>
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 pb-20">
                        <div className="w-full md:w-1/2 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.7,
                                    delay: 0.2,
                                    ease: [0.23, 1, 0.32, 1]
                                }}
                                className="md:text-left text-center font-medium text-3xl md:text-5xl"
                            >
                                <h1>Download and stream<br />
                                    <span className="text-transparent bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text">
                                        songs and playlists
                                    </span>
                                    <br />
                                    you love for free.
                                </h1>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.7,
                                    delay: 0.6,
                                    ease: [0.23, 1, 0.32, 1]
                                }}
                                className="text-muted-foreground font-light text-sm text-center md:text-left md:text-base max-w-md"
                            >
                                Enjoy music the way it always should've been—offline, ad-free, and always free to use.
                                Allow me to welcome you to Muse.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.7,
                                    delay: 1,
                                    ease: [0.23, 1, 0.32, 1]
                                }}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <Link
                                    to={user ? "/dashboard" : "/register"}
                                    className={cn(
                                        buttonVariants({ variant: "default" }),
                                        "w-full sm:w-auto font-bold group/arrow"
                                    )}
                                >
                                    Sign Up
                                    <ArrowRight className="size-5 ml-2 group-hover/arrow:translate-x-1 transition-transform" />
                                </Link>

                                <Button
                                    asChild
                                    variant="secondary"
                                    className="w-full sm:w-auto font-bold"
                                >
                                    <Link to="https://github.com/nyumat/muse" target="_blank">
                                        Github Repository
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>
                        <motion.div
                            className="relative w-full md:w-1/2"
                        >
                            <div className="absolute top-2 lg:-top-8 left-1/2 transform -translate-x-1/2 w-[90%] lg:w-full mx-auto h-24 lg:h-80 bg-primary/30 rounded-full blur-3xl"></div>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: 0,
                                        scale: 0.95,
                                        filter: 'blur(10px)'
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                        filter: 'blur(0px)'
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        delay: 0.5,
                                        ease: [0.23, 1, 0.32, 1]
                                    }}
                                    className="relative"
                                >
                                    <img
                                        className="w-full rounded-lg relative scale-100 md:scale-100 border border-t-2 border-secondary border-t-primary/30"
                                        src="/songs-preview.png"
                                        alt="dashboard"
                                    />
                                    <div className="absolute bottom-0 left-0 w-full h-20 md:h-28 bg-gradient-to-b from-background/0 via-background/90 to-background rounded-lg"></div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>
            </section>
        </>
    );
}