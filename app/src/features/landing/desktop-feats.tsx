import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/lib/utils'
import * as Accordion from '@radix-ui/react-accordion'
import { AnimatePresence, motion } from 'framer-motion'
import { BarChart2, Headphones, ListMusic, Music, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { LogoSlider } from './hero'
import { DemoPlayer } from './player-stub'

export function DesktopFeatures() {
    const [activeCard, setActiveCard] = useState('item-1')
    const [progress, setProgress] = useState(0)
    const [shouldPlay,] = useState(false)
    const featureData = [
        {
            id: 'item-1',
            title: 'Upload Music',
            description: 'Never lose your favorite songs from YouTube and SoundCloud. ',
            icon: <Music />,
            imageSource: '/upload.png',
            duration: 5000
        },
        {
            id: 'item-2',
            title: 'Create Playlists',
            description: 'Arrange your music into playlists and share your collections with friends.',
            icon: <ListMusic />,
            imageSource: '/playlist-create.png',
            duration: 5000
        },
        {
            id: 'item-3',
            title: 'Manage Your Music',
            description: 'Favorite, order, and edit your music collection to your heart\'s content.',
            icon: <Settings />,
            imageSource: '/song-list.png',
            duration: 5000
        },
        {
            id: 'item-4',
            title: 'Track Stats',
            description: `Monitor your listening habits with detailed statistics and insights.`,
            imageSource: '/dashboard.png',
            icon: <BarChart2 />,
            duration: 5000
        },
        {
            id: 'item-5',
            title: 'Free Playback For All',
            description: 'No more free tier limits and stupid ads - just enjoy your music, your way.',
            icon: <Headphones />,
            imageSource: '/high-quality.png',
            duration: 5000
        }
    ]

    const currentFeature = featureData.find((f) => f.id === activeCard)

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
                    const currentIndex = featureData.findIndex(f => f.id === prev)
                    const nextIndex = (currentIndex + 1) % featureData.length
                    return featureData[nextIndex].id
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

            <div className="mx-auto max-w-7xl px-4">
                <LogoSlider className='my-6' />
                <div className="flex flex-col items-center justify-center w-full mx-auto my-4">
                    <DemoPlayer className='mx-auto' shouldPlay={shouldPlay} />
                </div>
                <div className="mx-auto max-w-7xl border rounded-2xl p-2 mt-6">
                    <div className="grid grid-cols-[300px_1fr] gap-8 mx-2 my-3">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-bold">
                                Features
                            </h2>
                            <div className="flex flex-col gap-2">
                                <div className="pl-4 border-l-4 border-purple-500">
                                    <p className="text-sm text-purple-800 dark:text-purple-200">
                                        All the features, for all the users.
                                    </p>
                                </div>
                            </div>
                            <Accordion.Root
                                type="single"
                                defaultValue="item-1"
                                collapsible
                                value={activeCard}
                                onValueChange={setActiveCard}
                                className="flex flex-col gap-2 h-[400px] overflow-y-auto"
                            >
                                {featureData.map((feature) => (
                                    <Accordion.Item
                                        key={feature.id}
                                        value={feature.id}
                                        className={cn(
                                            "rounded-lg border overflow-hidden",
                                            activeCard === feature.id && "ring-1 ring-black/30 dark:ring-white/20"
                                        )}
                                    >
                                        <Accordion.Header className="flex">
                                            <Accordion.Trigger className="flex flex-1 items-center justify-between p-3 text-left">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "rounded-lg p-1 transition-colors",
                                                        activeCard === feature.id
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-accent text-primary"
                                                    )}>
                                                        {feature.icon}
                                                    </div>
                                                    <h3 className="text-sm font-medium">{feature.title}</h3>
                                                </div>
                                            </Accordion.Trigger>
                                        </Accordion.Header>
                                        <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="p-3 pt-0"
                                            >
                                                <p className="text-xs text-muted-foreground">
                                                    {feature.description}
                                                </p>
                                                <div className="mt-3 h-[3px] rounded-full bg-secondary">
                                                    <motion.div
                                                        className="h-full rounded-full bg-primary"
                                                        initial={{ width: "0%" }}
                                                        animate={{ width: `${progress}%` }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                </div>
                                            </motion.div>
                                        </Accordion.Content>
                                    </Accordion.Item>
                                ))}
                            </Accordion.Root>
                        </div>

                        <div className="relative w-full overflow-hidden rounded-lg border bg-black">
                            <AspectRatio ratio={16 / 9} className="bg-black">
                                <AnimatePresence mode="wait">
                                    {currentFeature && (
                                        <motion.div
                                            key={currentFeature.id}
                                            initial={{
                                                opacity: 0,
                                                filter: "blur(12px)",
                                                scale: 1.02
                                            }}
                                            animate={{
                                                opacity: 1,
                                                filter: "blur(0px)",
                                                scale: 1
                                            }}
                                            exit={{
                                                opacity: 0,
                                                filter: "blur(12px)",
                                                scale: 0.98
                                            }}
                                            transition={{
                                                duration: 0.6,
                                                ease: "easeInOut"
                                            }}
                                            className="h-full w-full"
                                        >
                                            <img
                                                src={currentFeature.imageSource}
                                                alt={`Muse feature ${currentFeature.title}`}
                                                className="h-full w-full object-cover brightness-90"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </AspectRatio>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
