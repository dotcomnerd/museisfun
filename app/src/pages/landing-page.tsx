import { Features } from '@/features/landing/features-all';
import { Footer } from '@/features/landing/footer';
import { HeroSection } from '@/features/landing/hero';
import { Navbar } from '@/features/landing/nav';

export function LandingPage() {
    return (
        <div>
            <Navbar />
            <HeroSection />
            <Features />
            <Footer />
        </div>
    );
}