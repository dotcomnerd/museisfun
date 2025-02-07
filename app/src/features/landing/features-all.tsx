"use client";

import { useEffect, useState } from "react";
import { DesktopFeatures } from './desktop-feats';
import { MobileFeatures } from './mobile-features';
import { Mission } from './mission';
import { ComparisonSection } from './compare';

export  function Features() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1049);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="w-full">
        <div className="bg-background/50 backdrop-blur-sm rounded-lg border border-border/50 shadow-sm">
          <div className="flex flex-col gap-4">
            {isMobile ? <MobileFeatures /> : <DesktopFeatures />}
          </div>

          <div className="flex flex-col gap-4 mb-6 lg:-mt-6">
            <Mission />
          </div>
        </div>
          <ComparisonSection />
      </div>
    </div>
  );
}
