import { motion, AnimatePresence } from 'framer-motion'
import { Headphones, ListMusic, Music, ChevronDown } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'

export function Features() {
    const [activeCard, setActiveCard] = useState(1)
    const [progress, setProgress] = useState(0)

    const featureData = [
        {
            id: 1,
            title: 'Upload Music',
            description: 'Upload your favorite songs from YouTube and SoundCloud with just one click.',
            icon: <Music />,
            imageSource: '/upload.png',
            duration: 5000
        },
        {
            id: 2,
            title: 'Create Playlists',
            description: 'Organize your music into unlimited playlists and share them with friends.',
            icon: <ListMusic />,
            imageSource: '/create-playlist.png',
            duration: 5000
        },
        {
            id: 3,
            title: 'High Quality',
            description: 'Enjoy crystal clear audio with our high-quality streaming.',
            icon: <Headphones />,
            imageSource: '/high-quality.png',
            duration: 5000
        }
    ]

    const currentFeature = featureData.find((f) => f.id === activeCard)

    const handleCardClick = (id: number) => {
        if (id === activeCard) return
        setProgress(0)
        setActiveCard(id)
    }

    useEffect(() => {
        const duration = currentFeature?.duration || 5000
        let startTime: number
        let animationFrame: number

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime
            const elapsedTime = currentTime - startTime
            const progress = Math.min((elapsedTime / duration) * 100, 100)

            setProgress(progress)

            if (progress < 100) {
                animationFrame = requestAnimationFrame(animate)
            } else {
                setActiveCard((prev) => {
                    const nextCard = prev + 1
                    return nextCard > featureData.length ? 1 : nextCard
                })
            }
        }

        animationFrame = requestAnimationFrame(animate)

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame)
            }
        }
    }, [activeCard, currentFeature?.duration])

    return (
        <section className="w-full pt-24 md:pt-32 pb-20">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mx-auto max-w-2xl space-y-4 text-center mb-16">
                    <div className="mb-2 inline-block rounded-full bg-primary/20 px-2 py-1 text-xs font-medium uppercase text-primary">
                        Features
                    </div>
                    <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        See Muse in action
                    </h2>
                    <p className="text-md text-muted-foreground max-w-lg mx-auto">
                        Discover the features that make Muse enough to cancel your Spotify subscription and switch to us.
                    </p>
                </div>

                <div className="grid grid-cols-[300px_1fr] gap-8">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-4">
                            {featureData.map((feature) => (
                                <motion.div
                                    key={feature.id}
                                    initial={false}
                                    animate={activeCard === feature.id ? "expanded" : "collapsed"}
                                    className={`relative rounded-lg border transition-all duration-300 ease-in-out ${
                                        activeCard === feature.id
                                            ? "ring-1 ring-primary"
                                            : ""
                                    } overflow-hidden`}
                                >
                                    <div className="relative">
                                        <button
                                            onClick={() => handleCardClick(feature.id)}
                                            className="w-full p-4 text-left focus:outline-none"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`rounded-lg p-1 transition-colors ${
                                                        activeCard === feature.id
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-accent text-primary"
                                                    }`}>
                                                        {feature.icon}
                                                    </div>
                                                    <h3 className="text-md font-medium">{feature.title}</h3>
                                                </div>
                                                <motion.div
                                                    variants={{
                                                        expanded: { rotate: 180 },
                                                        collapsed: { rotate: 0 },
                                                    }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                </motion.div>
                                            </div>
                                        </button>

                                        <motion.div
                                            initial={false}
                                            animate={{
                                                height: activeCard === feature.id ? "auto" : "0px",
                                            }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4">
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{
                                                        opacity: activeCard === feature.id ? 1 : 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.2,
                                                        delay: activeCard === feature.id ? 0.1 : 0,
                                                    }}
                                                    className="text-sm text-muted-foreground"
                                                >
                                                    {feature.description}
                                                </motion.p>
                                                {activeCard === feature.id && (
                                                    <div className="mt-3 h-[4px] rounded-full bg-secondary">
                                                        <motion.div
                                                            className="h-full rounded-full bg-primary"
                                                            initial={{ width: "0%" }}
                                                            animate={{ width: `${progress}%` }}
                                                            transition={{ duration: 0.3 }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="relative w-full overflow-hidden rounded-lg border bg-card">
                        <div className="aspect-[16/9]">
                            <AnimatePresence mode="wait">
                                {currentFeature && (
                                    <motion.div
                                        key={currentFeature.id}
                                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, filter: 'blur(10px)' }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="absolute inset-0 flex justify-center p-4"
                                    >
                                        <img
                                            src={currentFeature.imageSource}
                                            alt={`Muse feature ${currentFeature.title}`}
                                            className="w-full max-w-5xl rounded-lg object-contain"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
