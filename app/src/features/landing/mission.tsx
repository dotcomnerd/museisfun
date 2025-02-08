import Particles from "@/components/ui/particles";
import { motion } from "framer-motion";
import { Check } from 'lucide-react';

export function Mission() {
  return (
    <section className="w-full">
        <div className="relative flex flex-col items-center justify-center w-full max-w-6xl mx-auto">
        <div className="relative flex flex-col items-center justify-center py-12 lg:py-20 px-6 rounded-2xl lg:rounded-3xl bg-background/20 text-center border border-border overflow-hidden w-full">
          <Particles
            refresh
            ease={80}
            quantity={80}
            color="#d4d4d4"
            className="hidden lg:block absolute inset-0 z-0"
          />
          <Particles
            refresh
            ease={80}
            quantity={35}
            color="#d4d4d4"
            className="block lg:hidden absolute inset-0 z-0"
          />

          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -bottom-1/8 left-1/3 -translate-x-1/2 w-44 h-32 lg:h-52 lg:w-1/3 rounded-full blur-[5rem] lg:blur-[10rem] -z-10"
              style={{
                background: 'conic-gradient(from 0deg at 50% 50%,rgb(129, 0, 249) 0deg,rgba(3, 3, 3, 0.94) 180deg,rgba(132, 0, 233, 0.95) 360deg)',
              }}
              animate={{
                rotate: 360
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>

          <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl lg:text-5xl font-bold !leading-snug mb-6">Always free music, <br /> <span className="font-bold text-primary">as it should be.</span></h2>
            <div className="flex flex-col items-center space-y-4 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-primary/10 text-primary">
                    <Check className="h-5 w-5" />
                  </div>
                  <p className="text-foreground/80">100% free, forever</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-primary/10 text-primary">
                    <Check className="h-5 w-5" />
                  </div>
                    <p className="text-foreground/80">Open source, forever</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-primary/10 text-primary">
                    <Check className="h-5 w-5" />
                  </div>
                    <p className="text-foreground/80">No tracking, ever</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-primary/10 text-primary">
                    <Check className="h-5 w-5" />
                  </div>
                    <p className="text-foreground/80">No ads, ever</p>
                </div>
              </div>
            </div>
          </div>
          </div>

      </div>
    </section>
  );
}
