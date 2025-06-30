"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Badge } from '@/components/ui/badge';
import {
  MenuIcon,
  X,
  Sparkles,
  MessageSquare,
  BarChart3,
  CalendarDays,
  ChevronDown
} from 'lucide-react';

export function NewLandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      isScrolled
        ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800'
        : 'bg-transparent'
    }`}>
      <div className="px-3 sm:px-6 md:px-8 lg:px-16 max-w-screen-2xl mx-auto flex h-14 sm:h-16 items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-6">
          <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
            <span className="font-bold text-lg sm:text-xl">InterviewAI</span>
          </Link>

          <nav className="hidden md:flex gap-1">
            <div className="relative group">
              <button
                className="flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setFeaturesOpen(!featuresOpen)}
                aria-expanded={featuresOpen}
                aria-haspopup="true"
              >
                Features
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>

              {/* Dropdown menu */}
              <div
                className={`absolute left-0 mt-1 w-64 rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 ${
                  featuresOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
                role="menu"
                aria-orientation="vertical"
              >
                <div className="p-2">
                  <Link
                    href="#interviews"
                    className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setFeaturesOpen(false)}
                    role="menuitem"
                  >
                    <div className="mt-1 bg-purple-100 dark:bg-purple-900/50 p-1.5 rounded-full">
                      <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">AI Interviews</h4>
                      <p className="text-xs text-muted-foreground">Automated candidate screening</p>
                    </div>
                  </Link>

                  <Link
                    href="#gemini"
                    className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setFeaturesOpen(false)}
                    role="menuitem"
                  >
                    <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-full">
                      <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Gemini AI</h4>
                      <p className="text-xs text-muted-foreground">Powered by Google's AI</p>
                    </div>
                  </Link>

                  <Link
                    href="#analytics"
                    className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setFeaturesOpen(false)}
                    role="menuitem"
                  >
                    <div className="mt-1 bg-amber-100 dark:bg-amber-900/50 p-1.5 rounded-full">
                      <BarChart3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Analytics</h4>
                      <p className="text-xs text-muted-foreground">Detailed candidate insights</p>
                    </div>
                  </Link>

                  <Link
                    href="#scheduling"
                    className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setFeaturesOpen(false)}
                    role="menuitem"
                  >
                    <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1.5 rounded-full">
                      <CalendarDays className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Scheduling</h4>
                      <p className="text-xs text-muted-foreground">Automated calendar integration</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="#testimonials"
              className="px-2.5 py-1.5 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Testimonials
            </Link>

            <Link
              href="#platform-overview"
              className="px-2.5 py-1.5 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Platform Overview
            </Link>

            <Link
              href="/dashboard/ai-assistant"
              className="px-2.5 py-1.5 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-1">
                <span>Gemini Demo</span>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/50 ml-1 text-xs px-1.5 py-0">
                  New
                </Badge>
              </div>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden md:flex gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                Get Started
              </Button>
            </Link>
          </nav>

          <ModeToggle />

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <MenuIcon size={18} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t fixed inset-x-0 top-14 sm:top-16 bg-white dark:bg-gray-900 z-40 shadow-lg animate-in slide-in-from-top max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div className="px-3 sm:px-6 py-3 sm:py-4 flex flex-col gap-1">
            <div className="border-b pb-2 mb-2">
              <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">Features</p>
              <Link
                href="#interviews"
                className="flex items-start gap-2.5 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">AI Interviews</p>
                  <p className="text-xs text-muted-foreground">Automated candidate screening</p>
                </div>
              </Link>

              <Link
                href="#gemini"
                className="flex items-start gap-2.5 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Gemini AI</p>
                  <p className="text-xs text-muted-foreground">Powered by Google's AI</p>
                </div>
              </Link>

              <Link
                href="#analytics"
                className="flex items-start gap-2.5 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Analytics</p>
                  <p className="text-xs text-muted-foreground">Detailed candidate insights</p>
                </div>
              </Link>
            </div>

            <Link
              href="#testimonials"
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonials
            </Link>

            <Link
              href="#platform-overview"
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              Platform Overview
            </Link>

            <Link
              href="/dashboard/ai-assistant"
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex items-center text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Gemini Demo</span>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/50 ml-2 text-xs px-1.5 py-0">
                New
              </Badge>
            </Link>

            <div className="pt-3 mt-2 border-t flex flex-col gap-2">
              <Link href="/auth/login" className="w-full">
                <Button variant="outline" className="w-full" size="sm">Sign in</Button>
              </Link>
              <Link href="/auth/register" className="w-full">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}