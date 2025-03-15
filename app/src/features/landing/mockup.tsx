import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';

export function Mockup() {
  return (
    <>
      <div className="hidden lg:block">
        <div className="relative w-[140%] xl:w-[200%] max-w-[1600px]">
          <div className="rounded-l-xl overflow-hidden shadow-[0_20px_50px_-15px_rgba(139,92,246,0.15)] bg-background/95 backdrop-blur-sm border-l border-y border-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-12px_rgba(139,92,246,0.25)]">
            <div className="bg-primary/5 dark:bg-primary/10 p-1.5 flex items-center gap-2 border-b border-primary/10 backdrop-blur-md">
              <div className="flex gap-1 mx-4 scale-150">
                <div className="w-2 h-2 rounded-full bg-red-500/90" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/90" />
                <div className="w-2 h-2 rounded-full bg-green-500/90" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="border border-primary/20 rounded-full py-2">
                  <Lock className="size-2 opacity-50 mx-2" />
                </div>
                <Input
                  disabled
                  type="text"
                  value="https://museisfun.com"
                  readOnly
                  className="max-w-full h-6 mx-2 text-left text-sm font-light tracking-wide bg-background/50 backdrop-blur-sm border-primary/30 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
                />
              </div>
            </div>
            <div className="relative">
              <img
                className="w-full"
                src="/song-view.png"
                alt="Muse Song View"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
