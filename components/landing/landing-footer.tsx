"use client";

import Link from 'next/link';
import { ModeToggle } from '@/components/mode-toggle';
import { Sparkles, Mail, MapPin, Phone, Github, Twitter, Linkedin, Instagram } from 'lucide-react';

export function NewLandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
      <div className="px-4 sm:px-6 md:px-8 lg:px-16 max-w-screen-2xl mx-auto py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="font-bold text-xl">InterviewAI</span>
            </Link>
            <p className="text-muted-foreground mb-4 text-sm">
              Revolutionizing the hiring process with AI-powered interviews and Gemini integration.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <ModeToggle />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {[
                { label: "Features", href: "#features" },
                { label: "Platform Overview", href: "#platform-overview" },
                { label: "Testimonials", href: "#testimonials" },
                { label: "Gemini AI", href: "/dashboard/ai-assistant" },
                { label: "Graph Tracking", href: "#platform-overview" }
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {[
                { label: "About Us", href: "#" },
                { label: "Careers", href: "#" },
                { label: "Blog", href: "#" },
                { label: "Press", href: "#" },
                { label: "Partners", href: "#" }
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span>contact@interviewai.com</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Phone className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span>123 AI Boulevard, San Francisco, CA 94107</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} InterviewAI. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}