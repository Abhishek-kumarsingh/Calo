"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, CheckCircle2, BarChart3, Network, TrendingUp, LineChart, ArrowUpRight, BrainCircuit } from 'lucide-react';

export function LandingCTA() {
  return (
    <section id="platform-overview" className="py-24 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.03]" />
        <div className="absolute bottom-0 left-0 right-0 h-[30rem] bg-gradient-to-t from-purple-50/50 to-transparent dark:from-purple-950/20 dark:to-transparent -z-10" />

      <div className="px-4 sm:px-6 md:px-8 lg:px-16 max-w-screen-2xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
          <Badge variant="outline" className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border-blue-200 dark:border-blue-800 rounded-full inline-block mb-4">
            Platform Overview
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Advanced Interview Analytics Platform</h2>
          <p className="text-muted-foreground text-lg">
            Our comprehensive solution combines AI-powered interviews with sophisticated data visualization and tracking.
          </p>
        </div>

        {/* Graph Tracking Arrows Feature */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div
            data-aos="fade-right"
            data-aos-duration="1000"
          >
            <h3 className="text-2xl font-bold mb-4">Intelligent Graph Tracking</h3>
            <p className="text-muted-foreground mb-6">
              Our proprietary graph tracking system uses directional arrows to visualize candidate progression and performance trends across multiple dimensions.
            </p>

            <ul className="space-y-4">
              {[
                { icon: Network, title: "Relationship Mapping", description: "Visualize connections between skills, performance, and candidate responses", delay: 100 },
                { icon: TrendingUp, title: "Performance Trajectory", description: "Track improvement over time with dynamic directional indicators", delay: 200 },
                { icon: LineChart, title: "Comparative Analysis", description: "Compare multiple candidates with intuitive visual cues", delay: 300 },
                { icon: BrainCircuit, title: "AI-Powered Insights", description: "Automatically generated patterns and correlations", delay: 400 }
              ].map((feature, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3"
                  data-aos="fade-up"
                  data-aos-delay={feature.delay}
                >
                  <div className="mt-1 bg-purple-100 dark:bg-purple-900/50 p-1.5 rounded-full">
                    <feature.icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 relative overflow-hidden"
            data-aos="fade-left"
            data-aos-duration="1000"
          >
            <div className="relative h-80 w-full bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
              {/* Mock Graph with Arrows */}
              <div className="w-full h-full p-4 relative">
                {/* Graph nodes */}
                <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-purple-500 rounded-full"></div>
                <div className="absolute top-1/3 left-1/2 w-4 h-4 bg-blue-500 rounded-full"></div>
                <div className="absolute top-2/3 left-1/3 w-4 h-4 bg-green-500 rounded-full"></div>
                <div className="absolute top-1/2 left-3/4 w-4 h-4 bg-amber-500 rounded-full"></div>

                {/* Arrows */}
                <svg className="absolute inset-0 w-full h-full">
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
                    </marker>
                  </defs>
                  <path d="M100,80 L180,100" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  <path d="M180,100 L120,200" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  <path d="M120,200 L280,150" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrowhead)" />
                </svg>

                {/* Labels */}
                <div className="absolute top-1/5 left-1/4 -translate-x-1/2 -translate-y-8 text-xs font-medium">Technical Skills</div>
                <div className="absolute top-1/3 left-1/2 translate-x-2 -translate-y-6 text-xs font-medium">Communication</div>
                <div className="absolute top-2/3 left-1/3 -translate-x-1/2 translate-y-6 text-xs font-medium">Problem Solving</div>
                <div className="absolute top-1/2 left-3/4 translate-x-2 -translate-y-6 text-xs font-medium">Leadership</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Interactive visualization with directional tracking arrows</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div
          className="mt-16 text-center max-w-3xl lg:max-w-4xl mx-auto"
          data-aos="fade-up"
          data-aos-duration="1200"
          data-aos-anchor-placement="top-bottom"
        >
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-xl p-8 md:p-12 shadow-lg border border-purple-100 dark:border-purple-900/50">
            <Sparkles className="h-10 w-10 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Transform Your Hiring Process?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of companies using InterviewAI to find the best talent with the power of Gemini AI and advanced graph tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center" data-aos="fade-up" data-aos-delay="200">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all group">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard/ai-assistant">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Sparkles className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Try Gemini AI Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}