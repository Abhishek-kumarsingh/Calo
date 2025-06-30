"use client";

import { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  BarChart3,
  CalendarDays,
  Users,
  Clock,
  Brain,
  CheckCircle2,
  Zap,
  FileText,
  Code,
  Network,
  TrendingUp,
  LineChart,
  ArrowUpRight,
  GitGraph
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function NewLandingFeatures() {
  const [activeTab, setActiveTab] = useState('interviews');

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.03]" />
      <div className="absolute top-1/2 left-0 w-full h-[500px] bg-gradient-to-r from-purple-50/50 via-transparent to-blue-50/50 dark:from-purple-950/20 dark:via-transparent dark:to-blue-950/20 -translate-y-1/2 -z-10" />

      <div className="px-4 sm:px-6 md:px-8 lg:px-16 max-w-screen-2xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
          <Badge variant="outline" className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border-blue-200 dark:border-blue-800 rounded-full inline-block mb-4">
            Powerful Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need for Modern Hiring</h2>
          <p className="text-muted-foreground text-lg">
            Our platform combines AI-powered interviews, analytics, and scheduling to streamline your entire hiring process.
          </p>
        </div>

        <Tabs
          defaultValue="interviews"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-4xl lg:max-w-5xl mx-auto"
        >
          <TabsList className="grid grid-cols-4 w-full max-w-3xl mx-auto mb-12" data-aos="fade-up" data-aos-delay="200">
            <TabsTrigger value="interviews" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 dark:data-[state=active]:bg-purple-900/50 dark:data-[state=active]:text-purple-100">
              <MessageSquare className="h-4 w-4 mr-2" />
              AI Interviews
            </TabsTrigger>
            <TabsTrigger value="gemini" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 dark:data-[state=active]:bg-blue-900/50 dark:data-[state=active]:text-blue-100">
              <Sparkles className="h-4 w-4 mr-2" />
              Gemini AI
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900/50 dark:data-[state=active]:text-amber-100">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="graphtracking" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900 dark:data-[state=active]:bg-green-900/50 dark:data-[state=active]:text-green-100">
              <GitGraph className="h-4 w-4 mr-2" />
              Graph Tracking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interviews" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div
                className="order-2 md:order-1"
                data-aos="fade-right"
                data-aos-duration="1000"
              >
                <h3 className="text-2xl font-bold mb-4">AI-Powered Interview Platform</h3>
                <p className="text-muted-foreground mb-6">
                  Our intelligent interview system conducts thorough candidate assessments with adaptive questioning that responds to candidate answers in real-time.
                </p>

                <ul
                  className="space-y-4"
                >
                  {[
                    { icon: MessageSquare, title: "Dynamic Questioning", description: "Questions adapt based on candidate responses" },
                    { icon: Brain, title: "Skill Assessment", description: "Accurately evaluate technical and soft skills" },
                    { icon: Clock, title: "Time Efficiency", description: "Screen more candidates in less time" },
                    { icon: Users, title: "Bias Reduction", description: "Standardized evaluation criteria for all candidates" }
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3" data-aos="fade-up" data-aos-delay={i * 100}>
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
                className="order-1 md:order-2"
                data-aos="fade-left"
                data-aos-duration="1000"
              >
                <div className="relative">
                  <div className="bg-gradient-to-tr from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 p-1 rounded-xl shadow-xl">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-purple-100 dark:border-purple-900/50">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Live Interview</h3>
                              <p className="text-xs text-muted-foreground">Frontend Developer Position</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900/50">
                            Active
                          </Badge>
                        </div>

                        <div className="space-y-4 border-t border-b py-4">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-700 dark:text-blue-400 text-sm font-semibold">AI</span>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm">
                              Can you explain how you would optimize the performance of a React application?
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                              <span className="text-gray-700 dark:text-gray-400 text-sm font-semibold">JS</span>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-sm">
                              I would start by using React's built-in performance tools like React Profiler to identify bottlenecks. Then implement solutions like memoization with useMemo and useCallback, code-splitting with React.lazy, and optimizing re-renders with proper key usage...
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-700 dark:text-blue-400 text-sm font-semibold">AI</span>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm">
                              Great answer! Could you elaborate on how you would implement code-splitting in a large React application?
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 inline-block mr-1" />
                            15:42 remaining
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="bg-purple-50 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200 border-purple-200 dark:border-purple-800">
                              Technical
                            </Badge>
                            <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 border-blue-200 dark:border-blue-800">
                              React
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-200/50 dark:bg-purple-900/20 rounded-full blur-xl -z-10" />
                  <div className="absolute -top-4 -left-4 w-32 h-32 bg-blue-200/50 dark:bg-blue-900/20 rounded-full blur-xl -z-10" />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gemini" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div
                className="order-2 md:order-1"
                data-aos="fade-right"
                data-aos-duration="1000"
              >
                <div className="inline-flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-2xl font-bold">Gemini AI Integration</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Leverage Google's powerful Gemini 2.0 Flash model to enhance your hiring process with advanced AI capabilities.
                </p>

                <ul
                  className="space-y-4"
                >
                  {[
                    { icon: Brain, title: "Advanced Understanding", description: "Comprehends complex candidate responses with nuance" },
                    { icon: FileText, title: "Content Generation", description: "Creates custom interview questions for any role" },
                    { icon: Code, title: "Technical Assessment", description: "Evaluates code and technical explanations accurately" },
                    { icon: Zap, title: "Real-time Insights", description: "Provides instant feedback during interviews" }
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3" data-aos="fade-up" data-aos-delay={i * 100}>
                      <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-full">
                        <feature.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                className="order-1 md:order-2"
                data-aos="fade-left"
                data-aos-duration="1000"
              >
                <div className="relative">
                  <div className="bg-gradient-to-tr from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 p-1 rounded-xl shadow-xl">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-blue-100 dark:border-blue-900/50">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Gemini AI Assistant</h3>
                          <p className="text-xs text-muted-foreground">Helping you make better hiring decisions</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-700 dark:text-blue-400 text-sm font-semibold">You</span>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm">
                            Generate 5 technical questions for a senior React developer interview
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-sm">
                            <p className="font-medium mb-2">Here are 5 technical questions for a senior React developer:</p>
                            <ol className="space-y-2 list-decimal list-inside">
                              <li>Explain React's Concurrent Mode and how it improves user experience</li>
                              <li>How would you implement state management in a large-scale React application?</li>
                              <li>Describe your approach to performance optimization in React</li>
                              <li>How do you handle server-side rendering with React?</li>
                              <li>Explain how you would implement and test custom React hooks</li>
                            </ol>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-700 dark:text-blue-400 text-sm font-semibold">You</span>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm">
                            Add follow-up questions for the state management question
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-200/50 dark:bg-blue-900/20 rounded-full blur-xl -z-10" />
                  <div className="absolute -top-4 -left-4 w-32 h-32 bg-purple-200/50 dark:bg-purple-900/20 rounded-full blur-xl -z-10" />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div
                className="order-2 md:order-1"
                data-aos="fade-right"
                data-aos-duration="1000"
              >
                <div className="inline-flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-2xl font-bold">Comprehensive Analytics</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Make data-driven hiring decisions with detailed analytics and insights on candidate performance.
                </p>

                <ul
                  className="space-y-4"
                >
                  {[
                    { icon: BarChart3, title: "Performance Metrics", description: "Track key indicators across all interviews" },
                    { icon: Users, title: "Candidate Comparison", description: "Side-by-side evaluation of multiple candidates" },
                    { icon: CheckCircle2, title: "Skill Verification", description: "Objective assessment of technical abilities" },
                    { icon: CalendarDays, title: "Hiring Trends", description: "Identify patterns and optimize your process" }
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3" data-aos="fade-up" data-aos-delay={i * 100}>
                      <div className="mt-1 bg-amber-100 dark:bg-amber-900/50 p-1.5 rounded-full">
                        <feature.icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
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
                className="order-1 md:order-2"
                data-aos="fade-left"
                data-aos-duration="1000"
              >
                <div className="relative">
                  <div className="bg-gradient-to-tr from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 p-1 rounded-xl shadow-xl">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-amber-100 dark:border-amber-900/50">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Candidate Analytics</h3>
                            <p className="text-xs text-muted-foreground">Frontend Developer Position</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-2">
                            <p className="text-sm font-medium">Technical Knowledge</p>
                            <p className="text-sm font-bold">85/100</p>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 dark:bg-amber-600 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <p className="text-sm font-medium">Problem Solving</p>
                            <p className="text-sm font-bold">92/100</p>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 dark:bg-green-600 rounded-full" style={{ width: '92%' }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <p className="text-sm font-medium">Communication</p>
                            <p className="text-sm font-bold">78/100</p>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 dark:bg-blue-600 rounded-full" style={{ width: '78%' }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <p className="text-sm font-medium">Experience Relevance</p>
                            <p className="text-sm font-bold">88/100</p>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 dark:bg-purple-600 rounded-full" style={{ width: '88%' }}></div>
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium">Overall Score</p>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900/50">
                              86/100 - Excellent
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-amber-200/50 dark:bg-amber-900/20 rounded-full blur-xl -z-10" />
                  <div className="absolute -top-4 -left-4 w-32 h-32 bg-orange-200/50 dark:bg-orange-900/20 rounded-full blur-xl -z-10" />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="graphtracking" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div
                className="order-2 md:order-1"
                data-aos="fade-right"
                data-aos-duration="1000"
              >
                <div className="inline-flex items-center gap-2 mb-4">
                  <GitGraph className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-2xl font-bold">Advanced Graph Tracking</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Our proprietary graph tracking system uses directional arrows to visualize candidate progression and performance trends across multiple dimensions.
                </p>

                <ul
                  className="space-y-4"
                >
                  {[
                    { icon: Network, title: "Relationship Mapping", description: "Visualize connections between skills, performance, and candidate responses" },
                    { icon: TrendingUp, title: "Performance Trajectory", description: "Track improvement over time with dynamic directional indicators" },
                    { icon: LineChart, title: "Comparative Analysis", description: "Compare multiple candidates with intuitive visual cues" },
                    { icon: ArrowUpRight, title: "Trend Identification", description: "Spot patterns and correlations in candidate performance" }
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3" data-aos="fade-up" data-aos-delay={i * 100}>
                      <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1.5 rounded-full">
                        <feature.icon className="h-4 w-4 text-green-600 dark:text-green-400" />
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
                className="order-1 md:order-2"
                data-aos="fade-left"
                data-aos-duration="1000"
              >
                <div className="relative">
                  <div className="bg-gradient-to-tr from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 p-1 rounded-xl shadow-xl">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-green-100 dark:border-green-900/50">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                            <GitGraph className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Graph Tracking System</h3>
                            <p className="text-xs text-muted-foreground">Visualizing candidate performance</p>
                          </div>
                        </div>
                      </div>

                      <div className="relative h-64 w-full bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
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
                              <marker id="arrowhead-feature" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
                              </marker>
                            </defs>
                            <path d="M100,80 L180,100" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrowhead-feature)" />
                            <path d="M180,100 L120,200" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrowhead-feature)" />
                            <path d="M120,200 L280,150" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrowhead-feature)" />
                          </svg>

                          {/* Labels */}
                          <div className="absolute top-1/5 left-1/4 -translate-x-1/2 -translate-y-8 text-xs font-medium">Technical Skills</div>
                          <div className="absolute top-1/3 left-1/2 translate-x-2 -translate-y-6 text-xs font-medium">Communication</div>
                          <div className="absolute top-2/3 left-1/3 -translate-x-1/2 translate-y-6 text-xs font-medium">Problem Solving</div>
                          <div className="absolute top-1/2 left-3/4 translate-x-2 -translate-y-6 text-xs font-medium">Leadership</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <p className="text-xs">Technical Skills: 85/100</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <p className="text-xs">Communication: 78/100</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <p className="text-xs">Problem Solving: 92/100</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                          <p className="text-xs">Leadership: 88/100</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-green-200/50 dark:bg-green-900/20 rounded-full blur-xl -z-10" />
                  <div className="absolute -top-4 -left-4 w-32 h-32 bg-teal-200/50 dark:bg-teal-900/20 rounded-full blur-xl -z-10" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}