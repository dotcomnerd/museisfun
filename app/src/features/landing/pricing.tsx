import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import { useRef, useState } from "react";

const pricingPlans = [
    {
        name: "Free",
        description: "Perfect for casual listeners and newcomers",
        monthlyPrice: 0,
        annualPrice: 0,
        features: [
            "Upload up to 50 songs",
            "Create up to 3 playlists",
            "Basic streaming quality (128 kbps)",
            "500 MB storage limit",
            "Basic analytics",
        ],
    },
    {
        name: "Pro",
        description: "Enhanced features for dedicated music enthusiasts",
        monthlyPrice: 9.99,
        annualPrice: 99.99,
        features: [
            "Everything in free",
            "Unlimited playlists",
            "15 GB storage limit",
            "High-quality streaming (320 kbps)",
            "Advanced analytics",
            "Offline mode",
        ],
    },
    {
        name: "Premium",
        description: "Ultimate experience for creators and power users",
        monthlyPrice: 29.99,
        annualPrice: 299.99,
        features: [
            "Everything in free and pro",
            "Unlimited song uploads",
            "Unlimited playlists",
            "Ultra-high quality streaming",
            "Custom storage limit",
            "Full analytics suite",
            "API access",
            "Bulk upload tools",
        ],
    },
];

type BillingCycle = "M" | "A";

interface PricingHeadingProps {
    billingCycle: BillingCycle;
    setBillingCycle: (cycle: BillingCycle) => void;
}

const BackgroundShift = ({ shiftKey }: { shiftKey: string }) => (
    <motion.span
        key={shiftKey}
        layoutId="bg-shift"
        className="absolute inset-0 -z-10 rounded-lg bg-primary"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
    />
);

const PricingHeading = ({ billingCycle, setBillingCycle }: PricingHeadingProps) => {
    const headingRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(headingRef, {
        margin: "0px 0px -200px 0px"
    });

    return (
        <div className="relative z-10 my-12 flex flex-col items-center justify-center gap-4 pt-4">
            <div
                ref={headingRef}
                className="mx-auto max-w-2xl space-y-4 text-center px-2"
            >
                <div className="mb-2 inline-block rounded-full bg-primary/20 px-2 py-1 text-xs font-medium uppercase text-primary">
                    Pricing
                </div>
                <motion.p
                    className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
                    initial={{ opacity: 0, y: 100 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
                    transition={{ duration: 0.5 }}
                >
                    Choose your plan
                </motion.p>
                <p className="text-md text-muted-foreground max-w-lg">
                    Whether you're a casual listener or apple music refugee, Muse works for everyone.
                </p>
            </div>
            <div className="flex items-center justify-center gap-3">
                <button
                    onClick={() => setBillingCycle("M")}
                    className={cn(
                        `rounded-lg px-4 py-2 text-sm font-medium`,
                        billingCycle === "M"
                            ? "relative bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-accent"
                    )}
                >
                    Monthly
                    {billingCycle === "M" && <BackgroundShift shiftKey="monthly" />}
                </button>
                <button
                    onClick={() => setBillingCycle("A")}
                    className={cn(
                        `rounded-lg px-4 py-2 text-sm font-medium`,
                        billingCycle === "A"
                            ? "relative bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-accent"
                    )}
                >
                    Annual
                    {billingCycle === "A" && <BackgroundShift shiftKey="annual" />}
                </button>
            </div>
        </div>
    );
};

interface PricingCardsProps {
    billingCycle: BillingCycle;
}

const PricingCards = ({ billingCycle }: PricingCardsProps) => (
    <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row lg:gap-4 pb-40">
        {pricingPlans.map((plan, index) => (
            <div
                key={index}
                className={`w-full rounded-xl border bg-secondary p-6 text-left shadow-sm mx-auto max-w-xs md:max-w-none`}
                style={{ transform: `translateY(${index * 30}px)` }}
            >
                <p className="mb-1 mt-0 text-sm font-medium uppercase text-primary">
                    {plan.name}
                </p>
                <p className="my-0 mb-6 text-sm text-muted-foreground">
                    {plan.description}
                </p>
                <div className="mb-8 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={billingCycle === "M" ? "monthly" : "annual"}
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 100 }}
                            className="my-0 text-3xl font-semibold text-card-foreground"
                        >
                            <span>
                                ${billingCycle === "M" ? plan.monthlyPrice : plan.annualPrice}
                            </span>
                            <span className="text-sm font-medium">
                                /{billingCycle === "M" ? "month" : "year"}
                            </span>
                        </motion.p>
                    </AnimatePresence>
                    <motion.button
                        whileTap={{ scale: 0.985 }}
                        className="mt-8 w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        {plan.monthlyPrice === 0 ? "Get Started Free" : "Upgrade Now"}
                    </motion.button>
                </div>
                {plan.features.map((feature, idx) => (
                    <div key={idx} className="mb-3 flex items-center gap-2">
                        <Check className="text-primary" size={18} />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                ))}
            </div>
        ))}
    </div>
);

const Pricing = () => {
    const [billingCycle, setBillingCycle] = useState<BillingCycle>("M");

    return (
        <section className="relative w-full overflow-hidden py-12 text-foreground lg:px-2 lg:py-12">
            <PricingHeading billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
            <PricingCards billingCycle={billingCycle} />
        </section>
    );
};

export function PricingPage() {
    return <Pricing />;
}