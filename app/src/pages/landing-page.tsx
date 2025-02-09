import { HeroSection } from '@/features/landing/hero';
import { Navbar } from '@/features/landing/nav';
import { lazy, Suspense } from 'react';

const Features = lazy(() => import('@/features/landing/features-all').then(module => ({ default: module.Features })));
const Footer = lazy(() => import('@/features/landing/footer').then(module => ({ default: module.Footer })));

export function LandingPage() {
    return (
        <div>
            <Navbar />
            <HeroSection />
            <Suspense fallback={
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            }>
                <Features />
                <Footer />
            </Suspense>
        </div>
    );
}