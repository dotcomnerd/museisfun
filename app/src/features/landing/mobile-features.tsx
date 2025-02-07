import { Music, ListMusic, Settings, BarChart2, Headphones } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { DemoPlayer } from './player-stub';
import { useState } from 'react';
const featureData = [
  {
    id: 1,
    title: 'Manage Your Music',
    description: 'Sort, edit and stream your music collection with an intuitive dashboard. View detailed song information and manage your library effortlessly.',
    icon: <Settings className="h-5 w-5" />,
    imageSource: '/song-list.png',
  },
  {
    id: 2,
    title: 'Create & Organize Playlists',
    description: 'Build unlimited playlists, organize your music just the way you like it, and share your collections with friends.',
    icon: <ListMusic className="h-5 w-5" />,
    imageSource: '/playlist-create.png',
  },
  {
    id: 3,
    title: 'Track Listening Stats',
    description: `Monitor your listening habits with detailed statistics. See how much time you've spent with each song and track your music journey.`,
    imageSource: '/dashboard.png',
    icon: <BarChart2 className="h-5 w-5" />,
  },
  {
    id: 4,
    title: 'Upload Music',
    description: 'Upload your favorite songs from YouTube and SoundCloud with just one click. Build your personal music library.',
    icon: <Music className="h-5 w-5" />,
    imageSource: '/upload.png',
  },
  {
    id: 5,
    title: 'High Quality Streaming',
    description: 'Enjoy crystal clear audio with our high-quality streaming service. Listen to your music in the best possible quality.',
    icon: <Headphones className="h-5 w-5" />,
    imageSource: '/high-quality.png',
  }
]

export function MobileFeatures() {
  const [shouldPlay, setShouldPlay] = useState(false);
  return (
    <div className="p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Features</h2>
        <p className="mt-2 text-muted-foreground">Everything you need in one place</p>
      </div>

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {featureData.map((feature) => (
          <Card key={feature.id} className="overflow-hidden bg-background/60 backdrop-blur-sm">
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative aspect-video w-full cursor-pointer">
                  <img
                    className="h-full w-full object-cover"
                    src={feature.imageSource}
                    alt={feature.title}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
                    <Button variant="secondary" className="shadow-lg">
                      View Larger
                    </Button>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[90vw] h-[90vh]">
                <img
                  src={feature.imageSource}
                  alt={feature.title}
                  className="w-full h-full object-contain"
                />
              </DialogContent>
            </Dialog>

            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-lg p-2 bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <span>{feature.title}</span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="flex justify-center">
        <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 my-4">
          <Button
            variant="link"
            className="text-2xl font-bold mb-4 text-primary"
            onClick={() => setShouldPlay(true)}
          >
            Click Me
          </Button>
          <DemoPlayer className='max-w-7xl mx-auto' shouldPlay={shouldPlay} />
        </div>
      </div>
    </div>
  );
}
