import { motion } from 'framer-motion';

interface WelcomeMessageProps {
  username: string | undefined;
}

export function WelcomeMessage({ username }: WelcomeMessageProps) {
  const getMessage = () => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      return "Good morning";
    } else if (currentHour >= 12 && currentHour < 18) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  return (
    <motion.div
      className="space-y-2 text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
    >
      <motion.h1
        className="text-4xl md:text-6xl font-normal tracking-normal pb-3 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-purple-600"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          delay: 0.1
        }}
      >
        {getMessage()}, {username}
      </motion.h1>
      <motion.p
        className="text-muted-foreground text-lg md:text-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Welcome to Muse, the best way to own your music
      </motion.p>
    </motion.div>
  );
}
