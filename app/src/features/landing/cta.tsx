import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Check, Sparkles, Music, Headphones } from 'lucide-react';
import Particles from "@/components/ui/particles";
import { useState, useEffect } from 'react';

export function CallToAction() {
  const [activeIcon, setActiveIcon] = useState(0);

  const icons = [
    <Music className="h-5 w-5" key="music" />,
    <Headphones className="h-5 w-5" key="headphones" />,
    <Sparkles className="h-5 w-5" key="sparkles" />
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIcon((prev) => (prev + 1) % icons.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [icons.length]);

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          <motion.div
            className="relative flex flex-col items-center justify-center py-12 lg:py-16 px-6 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 shadow-sm overflow-hidden"
          >
            <Particles
              refresh
              ease={30}
              quantity={120}
              color="#9333ea"
              className="absolute inset-0 z-0"
              vx={0.2}
              vy={-0.1}
              size={0.6}
            />

            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute -bottom-1/4 right-1/4 w-44 h-44 lg:h-56 lg:w-56 rounded-full blur-[10rem] -z-10"
                style={{
                  background: 'conic-gradient(from 180deg at 50% 50%, #9333ea 0deg, #3b82f6 180deg, #9333ea 360deg)',
                  opacity: 0.4
                }}
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />

              <motion.div
                className="absolute top-1/4 left-1/4 w-32 h-32 lg:h-40 lg:w-40 rounded-full blur-[8rem] -z-10"
                style={{
                  background: 'conic-gradient(from 0deg at 50% 50%, #3b82f6 0deg, #9333ea 180deg, #3b82f6 360deg)',
                  opacity: 0.3
                }}
                animate={{
                  rotate: -360,
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>

            <div className="relative z-10 flex flex-col gap-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-col items-center"
              >
                <motion.div
                  className="mb-4 rounded-full bg-primary/20 p-3 text-primary"
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                >
                  {icons[activeIcon]}
                </motion.div>
                <h2 className="text-3xl md:text-5xl font-bold !leading-snug text-foreground">
                  Ready to <span className="text-primary">elevate</span> your <br /> music experience?
                </h2>
              </motion.div>

              <motion.p
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                viewport={{ once: true }}
              >
                Experience music the way it was meant to be - simple, beautiful, and all yours.
              </motion.p>

              <div className="flex flex-col items-center space-y-4 max-w-2xl mx-auto mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
                  {[
                    "Upload from anywhere",
                    "Create unlimited playlists",
                    "High-quality playback",
                    "Cross-device sync"
                  ].map((text, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (i * 0.1), duration: 0.5 }}
                      viewport={{ once: true }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="rounded-lg p-2 bg-primary/10 text-primary">
                        <Check className="h-5 w-5" />
                      </div>
                      <p className="text-foreground/80">{text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center mt-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500
                    text-white font-medium px-8 shadow-[0_0_0_3px_rgba(147,51,234,0.1)]
                    hover:shadow-[0_0_0_6px_rgba(147,51,234,0.2)] transition-all duration-300"
                  >
                    <Link to="/register" className="w-full h-full flex items-center justify-center">
                      Get Started
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-primary/30 hover:border-primary/50 text-primary
                    hover:bg-primary/5 font-medium px-8 backdrop-blur-sm
                    shadow-[0_0_0_0px_rgba(147,51,234,0)] hover:shadow-[0_0_0_4px_rgba(147,51,234,0.1)]
                    transition-all duration-300"
                  >
                    <Link to="/login" className="w-full h-full flex items-center justify-center">
                      Sign In
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>

              <motion.p
                className="text-sm text-muted-foreground mt-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                viewport={{ once: true }}
              >
                Start your journey in seconds.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
