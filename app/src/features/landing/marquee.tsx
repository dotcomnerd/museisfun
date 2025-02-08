import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InfiniteSlider } from '@/components/ui/inf-slider';
import { cn } from '@/lib/utils';

export function LogoMarquee({ className, cardClassName }: { className?: string, cardClassName?: string }) {
  return (

    <div className={cn("w-full mx-auto", className)}>
      <Card className={cn("w-full bg-background/50 backdrop-blur-sm", cardClassName)}>
        <CardHeader>
          <CardTitle>
            <h2 className="text-4xl font-bold">Supported Platforms</h2>
          </CardTitle>
          <CardDescription>
            <div className="flex flex-col gap-2">
              From SoundCloud to YouTube Music, Pandora, Deezer, and more, Muse integrates with all of your favorite streaming services.
              <div className="pl-4 border-l-4 border-purple-500">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  Muse cannot guarantee the availability of all services at all times.
                </p>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="-mx-6">
              <InfiniteSlider
                gap={48}
                reverse
                className="w-full py-8 bg-purple-200/50 dark:bg-purple-950/30 backdrop-blur-sm"
              >
                <img
                  src="/spotify.svg"
                  alt="Spotify logo"
                  className="h-[80px] w-auto opacity-80 [&>path]:fill-[#1DB954] dark:brightness-0 dark:invert"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/9/9d/AppleMusic_2019.svg"
                  alt="Apple Music logo"
                  className="h-[60px] w-auto opacity-80 dark:brightness-0 dark:invert"
                />
                <img
                  src="/ytmusic.svg"
                  alt="YouTube Music logo"
                  className='h-[60px] w-auto opacity-80 dark:hidden'
                />
                <img
                  src="/ytmusic-dark.svg"
                  alt="YouTube Music logo"
                  className='h-[60px] w-auto opacity-80 dark:block hidden'
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/d/dd/Deezer_logo_2019.svg"
                  alt="Deezer logo"
                  className="h-[60px] w-auto opacity-80 dark:invert"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/5/56/Pandora_Logo_2019.svg"
                  alt="Pandora logo"
                  className="h-[60px] w-auto opacity-80 dark:invert"
                />
                <img
                  src="/soundcloud.svg"
                  alt="SoundCloud logo"
                  className="h-[60px] w-auto opacity-80 dark:invert"
                />
              </InfiniteSlider>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}