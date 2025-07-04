"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight } from 'lucide-react';

export function NewLandingHero() {
  return (
    <section className="relative py-20 sm:py-28 md:py-36 lg:py-44 overflow-hidden">
      {/* Glassmorphism & Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 via-blue-300/20 to-pink-200/20 dark:from-purple-900/40 dark:via-blue-900/20 dark:to-pink-900/20 backdrop-blur-2xl -z-10" />
      <div className="absolute inset-0 bg-dot-pattern opacity-60 -z-10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300/30 dark:bg-purple-700/20 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-300/30 dark:bg-blue-700/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-pink-300/30 dark:bg-pink-700/20 rounded-full blur-3xl" />

      <div className="relative px-4 sm:px-6 md:px-8 lg:px-16 max-w-screen-2xl mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-16">
          <div data-aos="fade-up" data-aos-duration="1000">
            <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 dark:bg-gradient-to-r dark:from-purple-900/50 dark:to-blue-900/50 dark:text-purple-200 border-purple-200 dark:border-purple-800 rounded-full inline-block mb-4">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 inline-block animate-pulse" />
              The Future of Interviewing
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight bg-gradient-to-r from-purple-700 via-blue-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
              Elevate Your Hiring with <span className="underline decoration-wavy decoration-2 decoration-blue-400">AI-Driven Interviews</span>
            </h1>

            <p className="text-muted-foreground text-lg sm:text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-medium">
              Discover a new era of talent assessment. Our platform blends advanced AI, interactive analytics, and beautiful visualizations to help you hire smarter, faster, and fairer.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center" data-aos="fade-up" data-aos-delay="200">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all group text-lg font-semibold px-8 py-4 rounded-full">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-lg font-semibold px-8 py-4 rounded-full">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Hero image/mockup - glassy card with animation */}
        <div
          className="mt-12 sm:mt-16 md:mt-20 relative mx-auto max-w-5xl lg:max-w-4xl xl:max-w-5xl"
          data-aos="fade-up"
          data-aos-delay="400"
          data-aos-duration="1200"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-purple-100 dark:border-purple-900 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20" />
            <div className="bg-white/80 dark:bg-gray-900/80 p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 text-left">
                <h3 className="font-bold text-2xl md:text-3xl mb-2 text-purple-700 dark:text-purple-300">Intelligent, Adaptive, Beautiful</h3>
                <p className="text-muted-foreground text-base md:text-lg mb-4">
                  Adaptive questioning, real-time analytics, and stunning visual feedback—everything you need to make the best hiring decisions.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-base md:text-lg"><span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse" /> Adaptive AI Interviews</li>
                  <li className="flex items-center gap-2 text-base md:text-lg"><span className="inline-block w-2 h-2 bg-pink-500 rounded-full animate-pulse" /> Visual Analytics & Graphs</li>
                  <li className="flex items-center gap-2 text-base md:text-lg"><span className="inline-block w-2 h-2 bg-purple-500 rounded-full animate-pulse" /> Bias-Reducing Technology</li>
                </ul>
              </div>
              <div className="flex-1 flex items-center justify-center">
                {/* Replace with a beautiful SVG or animated illustration */}
                <img src="/ai-interview-illustration.svg" alt="AI Interview Illustration" className="w-full max-w-xs md:max-w-md drop-shadow-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-16 sm:mt-20 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: "Interviews Conducted", value: "12,000+", delay: 0 },
            { label: "Data Points Tracked", value: "6M+", delay: 100 },
            { label: "Graph Connections", value: "300K+", delay: 200 },
            { label: "Hiring Success Rate", value: "97%", delay: 300 }
          ].map((stat, i) => (
            <div
              key={i}
              className="flex flex-col p-2 sm:p-3"
              data-aos="fade-up"
              data-aos-delay={stat.delay}
            >
              <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-purple-600 dark:text-purple-400 leading-tight drop-shadow-md">{stat.value}</span>
              <span className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}