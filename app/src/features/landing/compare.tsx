import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import { Check, X, Music, Headphones, Youtube } from "lucide-react";
import { useRef } from "react";
import { GlowEffect } from "@/components/glow-effect";

const comparisonData = [
    {
        id: 1,
        name: "Muse",
        description: "Your personal music library",
        monthlyPrice: 0,
        icon: <Music className="h-6 w-6" />,
        colors: ['#8B5CF6', '#A855F7', '#D946EF', '#6B21A8'],
        features: [
            "Upload your own music",
            "No offline playback (yet)",
            "High quality audio (320kbps)",
            "Unlimited playlists",
            "No lyrics (yet)",
            "Open source software",
            "Full library control",
            "YouTube/SoundCloud integration",
            "Self-hostable",
            "Avoid vendor lock-in"
        ],
    },
    {
        id: 2,
        name: "Spotify",
        description: "Popular streaming service",
        monthlyPrice: 9.99,
        icon: <Headphones className="h-6 w-6" />,
        colors: ['#1DB954', '#191414'],
        features: [
            "Large music catalog",
            "No ads (Premium)",
            "Offline playback",
            "High quality audio",
            "Unlimited playlists",
            "Basic organization",
            "Limited library control",
            "No custom uploads",
            "No API access",
            "Basic stats only"
        ],
    },
    {
        id: 3,
        name: "YouTube Music",
        description: "Video-first music platform",
        monthlyPrice: 9.99,
        icon: <Youtube className="h-6 w-6" />,
        colors: ['#FF0000', '#282828'],
        features: [
            "Large music catalog",
            "No ads (Premium)",
            "Offline playback",
            "Variable quality",
            "Limited playlists",
            "Basic organization",
            "Limited library control",
            "No custom uploads",
            "Limited API access",
            "Basic stats only"
        ],
    }
];

const ComparisonHeading = () => {
    const headingRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(headingRef, {
        margin: "0px 0px -200px 0px"
    });

    return (
        <div className="relative z-10 my-16 flex flex-col items-center justify-center gap-6">
            <div
                ref={headingRef}
                className="mx-auto max-w-3xl text-center px-4 flex flex-col gap-2"
            >
                <div className="mb-4 block w-fit mx-auto rounded-full bg-primary/20 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-primary">
                    Comparison
                </div>
                <motion.h2
                    className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
                    initial={{ opacity: 0, y: 100 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
                    transition={{ duration: 0.5 }}
                >
                    How does Muse compare?
                </motion.h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    How Muse stacks up against other popular music streaming services
                </p>
            </div>
        </div>
    );
};

const ComparisonCards = () => {
    return (
        <div className="mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                {comparisonData.map((service) => (
                    <motion.div
                        key={service.id}
                        className="relative h-full"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: service.id * 0.1 }}
                    >
                        {service.id === 1 && (
                            <div className="absolute inset-0">
                                <GlowEffect
                                    className="w-full h-full"
                                    colors={service.colors}
                                    mode="colorShift"
                                    duration={5}
                                />
                            </div>
                        )}
                        <div className={cn(
                            "relative h-full rounded-2xl p-8",
                            "backdrop-blur-xl",
                            "border border-white/10",
                            "transition-all duration-300",
                            "hover:shadow-2xl hover:-translate-y-2",
                            service.id === 1
                                ? "bg-background/95 ring-2 ring-primary shadow-lg"
                                : "bg-background/80"
                        )}>
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "rounded-xl p-3 transition-colors",
                                    service.id === 1
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-accent text-primary"
                                )}>
                                    {service.icon}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">{service.name}</h3>
                                    <p className="text-lg font-medium text-muted-foreground">
                                        {service.id === 1 ? (
                                            <span className="text-emerald-500">Completely Free</span>
                                        ) : (
                                            `$${service.monthlyPrice}/mo`
                                        )}
                                    </p>
                                </div>
                            </div>

                            <p className="mt-6 text-base text-muted-foreground">{service.description}</p>

                            <div className="mt-8 space-y-3">
                                {service.features.map((feature, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="flex items-center gap-3 text-base"
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        {feature.includes("No") || feature.includes("Limited") ? (
                                            <X className="h-5 w-5 text-destructive" />
                                        ) : (
                                            <Check className="h-5 w-5 text-primary" />
                                        )}
                                        <span className="text-muted-foreground">{feature}</span>
                                    </motion.div>
                                ))}
                            </div>

                            {service.id === 1 && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="mt-8 w-full rounded-xl bg-primary py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 shadow-lg"
                                >
                                    Try Muse Free
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const Comparison = () => {
    return (
        <section className="relative w-full px-4 mb-12 bg-gradient-to-b from-background to-background/95">
            <ComparisonHeading />
            <ComparisonCards />
        </section>
    );
};

export function ComparisonSection() {
    return <Comparison />;
}