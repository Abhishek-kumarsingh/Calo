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
import {
  ChevronDown,
  Lightbulb,
  Plus,
} from 'lucide-react';

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

interface AIAssistantControlsProps {
  onPromptSelect?: (prompt: string) => void;
  onNewChat?: () => void;
  onToggleSidebar?: () => void;
}

export function AIAssistantControls({
  onPromptSelect,
  onNewChat,
  onToggleSidebar
}: AIAssistantControlsProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof PROMPT_SUGGESTIONS>('general');

  const handlePromptSelect = (prompt: string) => {
    if (onPromptSelect) {
      onPromptSelect(prompt);
    }
  };

  const handleNewChat = async () => {
    if (onNewChat) {
      onNewChat();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleNewChat}
        className="gap-1"
      >
        <Plus className="h-4 w-4" />
        New Chat
      </Button>

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


    </div>
  );
}
