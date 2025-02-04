import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Headphones, ListMusic, Music } from 'lucide-react'
import { useRef, useState } from 'react'

export function Features() {
    const [activeImage, setActiveImage] = useState(1)
    const ref = useRef(null)
    const isInView = useInView(ref)

    const ImageTabs = [
        {
            name: 'Upload Music',
            description:
                'Upload your favorite songs from YouTube and SoundCloud with just one click.',
            icon: <Music />,
        },
        {
            name: 'Create Playlists',
            description:
                'Organize your music into unlimited playlists and share them with friends.',
            icon: <ListMusic />,
        },
        {
            name: 'High Quality',
            description: 'Enjoy crystal clear audio with our high-quality streaming.',
            icon: <Headphones />,
        },
    ]

    const Images = [
        {
            imageNumber: 1,
            imageSource: '/upload.png',
        },
        {
            imageNumber: 2,
            imageSource: 'create-playlist.png',
        },
        {
            imageNumber: 3,
            imageSource: 'high-quality.png',
        },
    ]

    const handleImageChange = (index: number) => {
        setActiveImage(index)
    }

    return (
        <section className="w-full pt-24 md:pt-32 pb-20 scale-90">
            <div className="mx-auto flex max-w-7xl flex-col items-center px-4" ref={ref}>
                <div className="mx-auto max-w-2xl space-y-4 text-center">
                    <div className="mb-2 inline-block rounded-full bg-primary/20 px-2 py-1 text-xs font-medium uppercase text-primary">
                        Features
                    </div>
                    <motion.p
                        className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
                        initial={{ opacity: 0, y: 100 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
                        transition={{ duration: 0.5 }}
                    >
                        See Muse in action
                    </motion.p>
                    <p className="text-md text-muted-foreground max-w-lg">
                        Discover the features that make Muse enough to cancel your Spotify subscription and switch to us.
                    </p>
                </div>

                <div className="mt-8 w-full">
                    <div className="mb-10 flex w-full flex-col gap-2 md:flex-row">
                        {ImageTabs.map((tab, index) => (
                            <button
                                key={index}
                                className={`group relative flex w-full flex-col items-start p-3 text-left`}
                                onClick={() => handleImageChange(index + 1)}
                            >
                                <div
                                    className={`mb-3 rounded-lg p-1 transition-colors ${activeImage === index + 1
                                            ? `bg-primary text-primary-foreground`
                                            : `bg-accent text-primary hover:bg-primary hover:text-primary-foreground`
                                        }`}
                                >
                                    {tab.icon}
                                </div>
                                <div className="z-10 mb-2 text-xs font-semibold text-foreground">
                                    {tab.name}
                                </div>
                                <p className="z-10 m-0 text-xs text-muted-foreground md:text-sm">
                                    {tab.description}
                                </p>
                                {activeImage === index + 1 && (
                                    <motion.span
                                        layoutId="tab"
                                        transition={{ type: 'spring', duration: 0.3 }}
                                        className="absolute inset-0 rounded-md bg-secondary -z-50"
                                    ></motion.span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative w-full overflow-hidden rounded-lg border bg-card">
                    <AnimatePresence mode="wait">
                        {Images.map((image) => (
                            activeImage === image.imageNumber && (
                                <motion.div
                                    key={image.imageNumber}
                                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, filter: 'blur(10px)' }}
                                    transition={{
                                        duration: 0.4,
                                        ease: "easeOut"
                                    }}
                                    className="flex justify-center"
                                >
                                    <img
                                        src={image.imageSource}
                                        alt={`Muse feature ${image.imageNumber}`}
                                        className="w-full max-w-5xl rounded-lg object-cover"
                                    />
                                </motion.div>
                            )
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    )
}
