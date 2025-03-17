import { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronUp, ListMusic, Minimize2 } from "lucide-react";

export const EmptyState = memo(function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 h-[72px] bg-background/80 backdrop-blur-lg border-t z-[100] will-change-transform"
    >
      <div className="container mx-auto h-full flex flex-col">
        <div className="flex-1 flex items-center justify-between gap-4 px-4">
          <div className="flex items-center flex-1 min-w-0 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 min-w-0">
                <div className="h-4 w-32 bg-muted animate-pulse rounded mb-1" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="flex-1 min-w-0 hidden lg:block">
              <div className="h-1.5 w-full bg-muted animate-pulse rounded-full" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" disabled>
              <ListMusic className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost" disabled>
              <ChevronUp className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost" disabled>
              <Minimize2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
