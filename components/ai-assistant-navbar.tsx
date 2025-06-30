'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ChevronDown,
  Lightbulb,
  Code,
  FileText,
  Brain,
  MessageSquare,
  Settings,
  HelpCircle,
  Info,
  Zap,
  User,
  LogOut,
} from 'lucide-react';

interface AIAssistantNavbarProps {
  onPromptSelect?: (prompt: string) => void;
}

// Sample prompt suggestions by category
const PROMPT_SUGGESTIONS = {
  general: [
    "Explain quantum computing in simple terms",
    "What are the most effective ways to reduce stress?",
    "Tell me about the latest advancements in renewable energy",
    "How does machine learning work?"
  ],
  creative: [
    "Write a short story about a robot learning to feel emotions",
    "Create a poem about the changing seasons",
    "Suggest 5 creative team building activities",
    "Design a character for a sci-fi novel"
  ],
  coding: [
    "Create a JavaScript function to sort an array of objects by a property",
    "Explain the differences between REST and GraphQL APIs",
    "Write a Python function to find prime numbers",
    "How do I implement authentication in a React app?"
  ],
  business: [
    "Generate a marketing plan for a new eco-friendly product",
    "What are the best practices for sustainable web development?",
    "Create a SWOT analysis template",
    "How to improve team communication in remote work environments"
  ]
};

export function AIAssistantNavbar({ onPromptSelect }: AIAssistantNavbarProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof PROMPT_SUGGESTIONS>('general');

  const handlePromptSelect = (prompt: string) => {
    if (onPromptSelect) {
      onPromptSelect(prompt);
    }
  };

  return (
    <div className="w-full border-b bg-background sticky top-0 z-10">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span className="font-semibold text-lg">Gemini AI</span>
          </motion.div>
        </div>

        <div className="flex items-center gap-2">
          {/* Prompt Suggestions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Lightbulb className="h-4 w-4 text-purple-500" />
                <span>Suggestions</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <DropdownMenuLabel>Prompt Suggestions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <div className="flex gap-1 p-1 mb-2">
                <Button 
                  variant={activeCategory === 'general' ? 'default' : 'outline'} 
                  size="sm" 
                  className="flex-1 text-xs h-7"
                  onClick={() => setActiveCategory('general')}
                >
                  General
                </Button>
                <Button 
                  variant={activeCategory === 'creative' ? 'default' : 'outline'} 
                  size="sm" 
                  className="flex-1 text-xs h-7"
                  onClick={() => setActiveCategory('creative')}
                >
                  Creative
                </Button>
                <Button 
                  variant={activeCategory === 'coding' ? 'default' : 'outline'} 
                  size="sm" 
                  className="flex-1 text-xs h-7"
                  onClick={() => setActiveCategory('coding')}
                >
                  Coding
                </Button>
                <Button 
                  variant={activeCategory === 'business' ? 'default' : 'outline'} 
                  size="sm" 
                  className="flex-1 text-xs h-7"
                  onClick={() => setActiveCategory('business')}
                >
                  Business
                </Button>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto p-1">
                {PROMPT_SUGGESTIONS[activeCategory].map((prompt, index) => (
                  <DropdownMenuItem 
                    key={index} 
                    className="cursor-pointer py-2"
                    onClick={() => handlePromptSelect(prompt)}
                  >
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-purple-500 mt-0.5" />
                      <span className="text-sm">{prompt}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Capabilities Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Zap className="h-4 w-4 text-purple-500" />
                <span>Capabilities</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[250px]">
              <DropdownMenuLabel>Gemini AI Capabilities</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2 space-y-2">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Natural Conversations</p>
                    <p className="text-xs text-muted-foreground">Ask questions in a conversational way</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Code className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Code Generation</p>
                    <p className="text-xs text-muted-foreground">Create and debug code in multiple languages</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Content Creation</p>
                    <p className="text-xs text-muted-foreground">Generate creative text formats</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Brain className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Problem Solving</p>
                    <p className="text-xs text-muted-foreground">Get help with complex problems</p>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Help Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <HelpCircle className="h-4 w-4 text-purple-500" />
                <span>Help</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Info className="h-4 w-4 mr-2" />
                <span>About Gemini AI</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="h-4 w-4 mr-2" />
                <span>How to use</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 bg-purple-100">
                <User className="h-4 w-4 text-purple-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="h-4 w-4 mr-2" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
