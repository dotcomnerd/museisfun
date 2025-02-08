import { GlowEffect } from "@/components/glow-effect";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Headphones, Music, X, Youtube } from "lucide-react";
import { useNavigate } from 'react-router';

const comparisonData = [
    {
        id: 1,
        name: "Muse",
        description: "Your personal music library",
        monthlyPrice: 0,
        icon: <Music className="h-5 w-5 sm:h-6 sm:w-6" />,
        colors: ['#8B5CF6', '#A855F7', '#D946EF', '#6B21A8'],
        features: [
            "Large music catalog",
            "Upload your own music",
            "Limited offline playback",
            "High quality audio (320kbps)",
            "Unlimited playlists",
            "No lyrics support",
            "Full API access",
            "Real-time listening analytics",
            "Self-hostable",
            "Multi-provider support"
        ],
    },
    {
        id: 2,
        name: "Spotify",
        description: "Popular streaming service",
        monthlyPrice: 9.99,
        icon: <Headphones className="h-5 w-5 sm:h-6 sm:w-6" />,
        colors: ['#1DB954', '#191414'],
        features: [
            "Large music catalog",
            "No custom uploads",
            "Offline playback",
            "High quality audio",
            "Unlimited playlists",
            "Basic organization",
            "Limited API access",
            "Basic stats only",
            "Not self-hostable",
            "No provider support"
        ],
    },
    {
        id: 3,
        name: "YouTube Music",
        description: "Video-first music platform",
        monthlyPrice: 9.99,
        icon: <Youtube className="h-5 w-5 sm:h-6 sm:w-6" />,
        colors: ['#FF0000', '#282828'],
        features: [
            "Large music catalog",
            "No custom uploads",
            "Offline playback",
            "Variable quality",
            "Limited playlists",
            "Basic organization",
            "Limited API access",
            "Basic stats only",
            "Not self-hostable",
            "No provider support"
        ],
    }
];

const ComparisonHeading = () => {
    return (
        <div className="relative z-10 my-8 sm:my-16 flex flex-col items-center justify-center gap-4 sm:gap-6">
            <div className="mx-auto max-w-3xl text-center px-4 flex flex-col gap-2">
                <div className="mb-2 sm:mb-4 block w-fit mx-auto rounded-full bg-primary/20 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary">
                    Comparison
                </div>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                    How does Muse compare?
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                    How Muse stacks up against other popular music streaming services
                </p>
            </div>
        </div>
    );
};

const ComparisonCards = () => {
    const navigate = useNavigate();
    return (
        <div className="mx-auto px-4 sm:px-6 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 lg:gap-12">
                {comparisonData.map((service) => (
                    <div
                        key={service.id}
                        className="relative h-full"
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
                            "relative h-full rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8",
                            "backdrop-blur-xl",
                            "border border-white/10",
                            "transition-all duration-300",
                            "hover:shadow-2xl hover:-translate-y-2",
                            service.id === 1
                                ? "bg-background/95 ring-2 ring-primary shadow-lg"
                                : "bg-background/80"
                        )}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className={cn(
                                        "rounded-lg sm:rounded-xl p-2 sm:p-3 transition-colors",
                                        service.id === 1
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-accent text-primary"
                                    )}>
                                        {service.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold">{service.name}</h3>
                                        <p className="text-base sm:text-lg font-medium text-muted-foreground">
                                            {service.id === 1 ? (
                                                <span className="text-emerald-500">Completely Free</span>
                                            ) : (
                                                `$${service.monthlyPrice}/mo`
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-4 sm:mt-6 text-sm sm:text-base text-muted-foreground">{service.description}</p>

                                <div className="mt-6 sm:mt-8 space-y-2 sm:space-y-3">
                                    {service.features.map((feature, idx) => (
                                        <motion.div
                                            key={idx}
                                            className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            {feature.includes("No") || feature.includes("Limited") ? (
                                                <X className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
                                            ) : (
                                                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                            )}
                                            <span className="text-muted-foreground">{feature}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                {service.id === 1 && (
                                    <motion.button
                                        onClick={() => {
                                            navigate("/register");
                                        }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="mt-6 sm:mt-8 w-full rounded-lg sm:rounded-xl bg-primary py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-primary-foreground hover:bg-primary/90 shadow-lg"
                                    >
                                        Try Muse Free
                                    </motion.button>
                                )}
                            </motion.div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Comparison = () => {
    return (
        <section className="relative w-full px-4 mb-8 sm:mb-12 bg-gradient-to-b from-background to-background/95">
            <ComparisonHeading />
            <ComparisonCards />
        </section>
    );
};

export function ComparisonSection() {
    return <Comparison />;
}