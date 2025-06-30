import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NewLandingHero } from '@/components/landing/landing-hero';
import { NewLandingFeatures } from '@/components/landing/landing-features';
import { NewLandingTestimonials } from '@/components/landing/landing-testimonials';
import { LandingCTA } from '@/components/landing/landing-cta';
import { NewLandingFooter } from '@/components/landing/landing-footer';
import { NewLandingHeader } from '@/components/landing/landing-header';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <NewLandingHeader />
      <main className="flex-1">
        <NewLandingHero />
        <NewLandingFeatures />
        <NewLandingTestimonials />
        <LandingCTA />
      </main>
      <NewLandingFooter />
    </div>
  );
}