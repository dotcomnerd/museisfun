import { motion, AnimatePresence } from 'framer-motion'
import { Headphones, ListMusic, Music, ChevronDown, BarChart2, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'
import { LogoSlider } from './hero'
import { DemoPlayer } from './player-stub'

export function DesktopFeatures() {
    const [activeCard, setActiveCard] = useState(1)
    const [progress, setProgress] = useState(0)
    const [shouldPlay,] = useState(false)
    const featureData = [
        {
            id: 1,
            title: 'Manage Your Music',
            description: 'Sort, edit and stream your music collection with an intuitive dashboard. View detailed song information and manage your library effortlessly.',
            icon: <Settings />,
            imageSource: '/song-list.png',
            duration: 5000
        },
        {
            id: 2,
            title: 'Create & Organize Playlists',
            description: 'Build unlimited playlists, organize your music just the way you like it, and share your collections with friends.',
            icon: <ListMusic />,
            imageSource: '/playlist-create.png',
            duration: 5000
        },
        {
            id: 3,
            title: 'Track Listening Stats',
            description: `Monitor your listening habits with detailed statistics. See how much time you've spent with each song and track your music journey.`,
            imageSource: '/dashboard.png',
            icon: <BarChart2 />,
            duration: 5000
        },
        {
            id: 4,
            title: 'Upload Music',
            description: 'Upload your favorite songs from YouTube and SoundCloud with just one click. Build your personal music library.',
            icon: <Music />,
            imageSource: '/upload.png',
            duration: 5000
        },
        {
            id: 5,
            title: 'High Quality Streaming',
            description: 'Enjoy crystal clear audio with our high-quality streaming service. Listen to your music in the best possible quality.',
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
        <section className="w-full px-8 py-12">
            <div className="text-center">
                <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">Muse at a glance</h2>
                <p className="mt-2 text-muted-foreground">See for yourself 👇🏿 - including our live demo</p>
            </div>

            <div className="mx-auto px-4">
                <LogoSlider className='my-6' />
                <div className="flex flex-col items-center justify-center w-full mx-auto my-4">
                    <DemoPlayer className='mx-auto' shouldPlay={shouldPlay} />
                </div>
                <div className="grid grid-cols-[300px_1fr] gap-8">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-4">
                            {featureData.map((feature) => (
                                <motion.div
                                    key={feature.id}
                                    initial={false}
                                    animate={activeCard === feature.id ? "expanded" : "collapsed"}
                                    className={`relative rounded-lg border transition-all duration-300 ease-in-out ${activeCard === feature.id
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
                                                    <div className={`rounded-lg p-1 transition-colors ${activeCard === feature.id
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
                        <AnimatePresence mode="wait">
                            {currentFeature && (
                                <motion.div
                                    key={currentFeature.id}
                                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, filter: 'blur(10px)' }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="flex justify-center"
                                >
                                    <img
                                        src={currentFeature.imageSource}
                                        alt={`Muse feature ${currentFeature.title}`}
                                        className="w-full max-w-5xl rounded-lg object-cover"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    )
}
