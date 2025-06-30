'use client';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import Link from 'next/link';
import {
  Sparkles,
  MessageSquare,
  Code,
  FileText,
  Brain,
  Lightbulb,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export function AIAssistantLanding() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-2 bg-purple-100 rounded-full mb-4" data-aos="fade-down">
          <Sparkles className="h-6 w-6 text-purple-600" />
        </div>
        <h1 className="text-4xl font-bold mb-4" data-aos="fade-up" data-aos-delay="100">Gemini AI Assistant</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8" data-aos="fade-up" data-aos-delay="200">
          Powered by Google's advanced Gemini 2.0 Flash model to help you with tasks, answer questions, and generate content.
        </p>
        <div className="flex items-center justify-center gap-4" data-aos="fade-up" data-aos-delay="300">
          <Link href="/dashboard/ai-assistant">
            <Button size="lg" className="gap-2">
              Try Gemini AI
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="https://ai.google.dev/docs/gemini_api_overview" target="_blank">
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <Card className="border-2 border-purple-100" data-aos="fade-up" data-aos-delay="100">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-full bg-purple-100">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Conversations
              </Badge>
            </div>
            <CardTitle>Natural Conversations</CardTitle>
            <CardDescription>
              Engage in human-like conversations with context awareness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {[
                "Ask complex questions and follow-ups",
                "Get detailed explanations on any topic",
                "Receive personalized recommendations",
                "Maintain context throughout the conversation"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-100" data-aos="fade-up" data-aos-delay="200">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-full bg-blue-100">
                <Code className="h-5 w-5 text-blue-600" />
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Development
              </Badge>
            </div>
            <CardTitle>Code Assistant</CardTitle>
            <CardDescription>
              Get help with coding tasks and technical problems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {[
                "Generate code snippets in multiple languages",
                "Debug existing code and fix issues",
                "Explain complex algorithms and patterns",
                "Optimize code for better performance"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-100" data-aos="fade-up" data-aos-delay="300">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-full bg-amber-100">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Content
              </Badge>
            </div>
            <CardTitle>Content Creation</CardTitle>
            <CardDescription>
              Generate creative and professional content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {[
                "Write articles, stories, and blog posts",
                "Create marketing copy and product descriptions",
                "Generate creative ideas and concepts",
                "Summarize long documents and research"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* How It Works Section */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4" data-aos="fade-up">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">
            Using the Gemini AI Assistant is simple and intuitive. Just follow these steps:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Ask a Question",
              description: "Type your question or request in the chat input. Be as specific or general as you need.",
              icon: MessageSquare,
              color: "bg-purple-100 text-purple-600"
            },
            {
              step: "2",
              title: "Get AI Response",
              description: "Gemini processes your request and generates a thoughtful, accurate response in seconds.",
              icon: Brain,
              color: "bg-blue-100 text-blue-600"
            },
            {
              step: "3",
              title: "Follow Up",
              description: "Continue the conversation with follow-up questions or new topics as needed.",
              icon: Lightbulb,
              color: "bg-amber-100 text-amber-600"
            }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center" data-aos="fade-up" data-aos-delay={i * 100 + 200}>
              <div className="relative mb-6">
                <div className={`w-16 h-16 rounded-full ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <div className="absolute top-0 right-0 -mr-3 -mt-3 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  {item.step}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 text-center" data-aos="fade-up" data-aos-duration="1000">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4" data-aos="fade-up" data-aos-delay="100">Ready to Experience Gemini AI?</h2>
          <p className="text-lg text-muted-foreground mb-8" data-aos="fade-up" data-aos-delay="200">
            Start using the power of Google's Gemini 2.0 Flash model to enhance your productivity and creativity.
          </p>
          <Link href="/dashboard/ai-assistant" data-aos="zoom-in" data-aos-delay="300">
            <Button size="lg" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Try Gemini AI Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}