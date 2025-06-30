"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, MessageSquare, Brain, Zap } from 'lucide-react';

export function NewLandingHero() {

  return (
    <section className="relative py-16 sm:py-20 md:py-28 lg:py-32 overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 bg-dot-pattern opacity-70 -z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 to-transparent dark:from-purple-950/20 dark:to-transparent -z-10" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-pink-300/20 dark:bg-pink-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative px-4 sm:px-6 md:px-8 lg:px-16 max-w-screen-2xl mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12">
            <div data-aos="fade-up" data-aos-duration="1000">
            <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 border-purple-200 dark:border-purple-800 rounded-full inline-block mb-3 sm:mb-4">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 inline-block" />
              Powered by Google's Gemini AI
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight">
              Advanced <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">AI-Powered Interview Platform</span> with Graph Tracking
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg md:text-xl mb-4 sm:mb-5 max-w-3xl mx-auto">
              InterviewAI combines intelligent interviews with Gemini's advanced AI and proprietary graph tracking technology to visualize candidate performance across multiple dimensions.
            </p>

            <p className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8 max-w-3xl mx-auto">
              Our innovative directional arrow visualization system helps you identify patterns, track progress, and make data-driven hiring decisions with unprecedented clarity.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center" data-aos="fade-up" data-aos-delay="200">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard/ai-assistant" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30">
                  <Sparkles className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Try Gemini AI Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Hero image/mockup */}
        <div
          className="mt-10 sm:mt-12 md:mt-16 relative mx-auto max-w-5xl lg:max-w-4xl xl:max-w-5xl"
          data-aos="fade-up"
          data-aos-delay="400"
          data-aos-duration="1200"
        >
          <div className="relative rounded-xl overflow-hidden shadow-2xl border border-purple-100 dark:border-purple-900">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-blue-500/5 dark:from-purple-500/10 dark:to-blue-500/10" />

            {/* Browser mockup header */}
            <div className="bg-gray-100 dark:bg-gray-800 p-1.5 sm:p-2 flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400" />
              <div className="ml-2 sm:ml-4 bg-white dark:bg-gray-700 rounded-md px-2 sm:px-3 py-0.5 sm:py-1 text-xs text-gray-500 dark:text-gray-300 flex-1 max-w-md mx-auto text-center truncate">
                interviewai.app/dashboard/ai-assistant
              </div>
            </div>

            {/* Screenshot/mockup content */}
            <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 md:p-6 lg:p-8">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 md:p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">Gemini AI Assistant</h3>
                      <p className="text-xs text-muted-foreground">Powered by Google's advanced AI</p>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 dark:text-blue-400 text-xs sm:text-sm font-semibold">You</span>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 sm:p-3 text-xs sm:text-sm">
                        What qualities should I look for in a frontend developer?
                      </div>
                    </div>

                    <div className="flex gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-700 dark:text-purple-400" />
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 sm:p-3 text-xs sm:text-sm">
                        When hiring a frontend developer, look for these key qualities:
                        <ul className="mt-1.5 sm:mt-2 space-y-0.5 sm:space-y-1 list-disc list-inside text-xs sm:text-sm">
                          <li>Strong JavaScript, HTML, CSS fundamentals</li>
                          <li>Experience with modern frameworks (React, Vue, Angular)</li>
                          <li>Understanding of responsive design principles</li>
                          <li>Knowledge of performance optimization</li>
                          <li>Problem-solving and debugging skills</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:w-56 lg:w-64 space-y-3 sm:space-y-4 mt-3 md:mt-0">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-100 dark:border-gray-700">
                    <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">Interview Tools</h4>
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-white dark:bg-gray-700 rounded-md text-xs sm:text-sm">
                        <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                        <span>AI Interviewer</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-white dark:bg-gray-700 rounded-md text-xs sm:text-sm">
                        <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                        <span>Candidate Analysis</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-white dark:bg-gray-700 rounded-md text-xs sm:text-sm">
                        <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400" />
                        <span>Quick Questions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -bottom-6 -right-6 w-16 sm:w-24 h-16 sm:h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full blur-xl -z-10" />
          <div className="absolute -top-6 -left-6 w-20 sm:w-32 h-20 sm:h-32 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-xl -z-10" />
        </div>

        {/* Stats section */}
        <div className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center">
          {[
            { label: "Interviews Conducted", value: "10,000+", delay: 0 },
            { label: "Data Points Tracked", value: "5M+", delay: 100 },
            { label: "Graph Connections", value: "250K+", delay: 200 },
            { label: "Hiring Success Rate", value: "94%", delay: 300 }
          ].map((stat, i) => (
            <div
              key={i}
              className="flex flex-col p-2 sm:p-3"
              data-aos="fade-up"
              data-aos-delay={stat.delay}
            >
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 leading-tight">{stat.value}</span>
              <span className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}