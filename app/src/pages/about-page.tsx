import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Footer } from "@/features/landing/footer";
import { Navbar } from "@/features/landing/nav";
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ArrowRight, Github, Globe, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

const projects = [
    {
        title: "NextJudge",
        description: "A competitive coding platform for students to practice coding problems and compete with each other.",
        image: "https://freedesign.fyi/demo.png",
        productImage: "https://freedesign.fyi/demo.png",
        product: "https://nextjudge.vercel.app",
        github: "https://github.com/nextjudge/nextjudge",
    },
    {
        title: "NyumatFlix",
        description: "A next-generation streaming service that lets you watch your favorite movies and TV shows...for free.",
        image: "https://nyumatflix.com/preview.png",
        productImage: "https://freedesign.fyi/nyumatflix-preview.webp",
        product: "https://nyumatflix.com",
        github: "https://github.com/nyumat/nyumatflix",
    },
    {
        title: "Seleneo",
        description: "A real-time incident tracking map for communities around the world to report and view incidents.",
        image: "https://dont-commit-crimes.vercel.app/og-image.png",
        product: "https://dont-commit-crimes.vercel.app",
        productImage: "https://dont-commit-crimes.vercel.app/preview.png",
        github: "https://github.com/nyumat/incivent",
    },
    {
        title: "DubJam",
        description: "A collaborative music creation platform that lets you create beats and melodies with friends, in real-time.",
        image: "https://dubjam.onrender.com/meta.png",
        productImage: "https://freedesign.fyi/dubjam.webp",
        product: "https://dubjam.onrender.com",
        github: "https://github.com/Nyumat/dubhacks",
    },
];

function ProjectShowcase() {
    const [selectedProject, setSelectedProject] = useState<(typeof projects)[0] | null>(null);

    return (
        <section className="mt-16 mb-8">
            <h2 className="text-2xl font-normal tracking-tighter mb-6">Other Projects by <Link className="text-primary hover:underline" to="https://github.com/nyumat">Nyumat</Link></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project, index) => (
                    <div
                        key={index}
                        className="cursor-pointer group relative overflow-hidden rounded-lg border bg-background transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setSelectedProject(project)}
                    >
                        <AspectRatio ratio={16 / 9}>
                            <img
                                src={project.image}
                                alt={project.title}
                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            />
                        </AspectRatio>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-4 left-4">
                                <h3 className="text-white font-semibold">{project.title}</h3>
                                <p className="text-white/80 text-sm">Click to learn more</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AlertDialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
                <AlertDialogContent className="max-w-3xl">
                    <div className="absolute right-4 top-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedProject(null)}
                            className="hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl">{selectedProject?.title}</AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            {selectedProject?.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="my-4">
                        <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg border">
                            <img
                                src={selectedProject?.productImage}
                                alt={`${selectedProject?.title} Preview`}
                                className="object-cover w-full h-full"
                            />
                        </AspectRatio>
                    </div>
                    <AlertDialogFooter className="flex sm:justify-start gap-2 mt-2">
                        <Button variant="default" asChild>
                            <Link to={selectedProject?.github || ''} target="_blank" rel="noopener noreferrer" className="gap-2">
                                <Github className="h-4 w-4" />
                                GitHub
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to={selectedProject?.product || ''} target="_blank" rel="noopener noreferrer" className="gap-2">
                                <Globe className="h-4 w-4" />
                                Visit Site
                            </Link>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}

export function AboutPage() {
    const isMobile = useIsMobile();
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className={cn("container mx-auto px-4 py-10 md:py-16 md:px-6 lg:px-8 my-6", isMobile && "px-0")}>
                <article className="prose prose-gray dark:prose-invert mx-auto max-w-3xl">
                    <div className="relative h-[400px] w-full mb-12 rounded-xl overflow-hidden">
                        <img
                            src={isMobile ? "/preview-mobile.png" : "/preview.png"}
                            alt="Muse Interface"
                            className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                        <div className="absolute bottom-8 left-8 right-8">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
                                Your Music, Your Way
                            </h1>
                            <p className="text-lg text-white/80">
                                Break free from the constraints of traditional streaming
                            </p>
                        </div>
                    </div>

                    <div className="space-y-12">
                        <section>
                            <p className="text-lg leading-relaxed">
                                Remember when music felt personal? When you could craft the perfect playlist without hitting skip limits or dealing with forced shuffles? Muse brings that freedom back. We've built a platform that puts you in control of your music journey, whether you're diving into YouTube's endless music catalog or exploring SoundCloud's independent artists.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-3xl font-bold tracking-tight mb-6">
                                What Sets Muse Apart
                            </h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <h3 className="text-xl font-semibold">Universal Import</h3>
                                    <p>Pull your favorite tracks from YouTube and SoundCloud instantly. No more platform hopping.</p>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-xl font-semibold">Smart Organization</h3>
                                    <p>Create collections that tell your story. Tag, sort, and arrange your music your way.</p>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-xl font-semibold">Cloud Sync</h3>
                                    <p>Your library follows you everywhere. Pick up right where you left off on any device.</p>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-xl font-semibold">Zero Cost</h3>
                                    <p>All features, no fees. Music shouldn't come with a subscription.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-3xl font-bold tracking-tight mb-6">
                                The Road Ahead
                            </h2>
                            <p className="text-lg leading-relaxed mb-6">
                                We're building more than just a player - we're creating a new way to experience music. Our upcoming features will transform how you discover, share, and enjoy your favorite tracks:
                            </p>
                            <ul className="space-y-4 list-none pl-0">
                                <li className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                                    <span>Create collaborative playlists with friends in real-time</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                                    <span>Take your music offline with our upcoming mobile apps</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                                    <span>Connect with like-minded music lovers through enhanced social features</span>
                                </li>
                            </ul>
                        </section>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                className="group px-8 py-6 text-white rounded-lg font-semibold transition-all"
                                variant="default"
                                asChild
                            >
                                <Link to="/register" className="inline-flex items-center gap-2">
                                    Start Your Collection
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>

                            <Button asChild variant="outline" className="py-6">
                                <Link to="https://github.com/nyumat/muse" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                                    <Github className="h-4 w-4" />
                                    View Source
                                </Link>
                            </Button>
                        </div>
                    </div>
                    <ProjectShowcase />
                </article>
            </main>
            <Footer />
        </div>
    );
}
