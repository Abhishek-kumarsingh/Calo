'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { AIAssistantControls } from './ai-assistant-controls';

interface AIAssistantHeaderInjectorProps {
  onPromptSelect: (prompt: string) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
}

export function AIAssistantHeaderInjector({
  onPromptSelect,
  onNewChat,
  onToggleSidebar
}: AIAssistantHeaderInjectorProps) {
  const pathname = usePathname();
  const [injected, setInjected] = useState(false);

  // Only inject on the AI Assistant page
  const isAIAssistantPage = pathname === '/dashboard/ai-assistant' ||
                           pathname?.startsWith('/dashboard/ai-assistant/');

  useEffect(() => {
    if (!isAIAssistantPage || injected) return;

    // Find the container in the dashboard header
    const headerControlsContainer = document.querySelector('.dashboard-header-controls');

    if (headerControlsContainer) {
      // Create a container for our controls
      const controlsContainer = document.createElement('div');
      controlsContainer.id = 'ai-assistant-controls-container';
      controlsContainer.className = 'flex items-center gap-2';

      // Render our controls into this container
      const root = document.createElement('div');
      controlsContainer.appendChild(root);

      // Add the container to the header
      headerControlsContainer.appendChild(controlsContainer);

      // Create a new instance of AIAssistantControls
      const controls = document.createElement('div');
      controls.className = 'ai-assistant-controls';
      controls.innerHTML = `
        <button id="new-chat-btn" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
          New Chat
        </button>
        <button id="history-btn" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-purple-500"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          History
        </button>
        <button id="suggestions-btn" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-purple-500"><path d="M12 2v8"></path><path d="m4.93 10.93 1.41 1.41"></path><path d="M2 18h2"></path><path d="M20 18h2"></path><path d="m19.07 10.93-1.41 1.41"></path><path d="M22 22H2"></path><path d="M12 18a5 5 0 0 1-5-5"></path><path d="M17 13a5 5 0 0 0-10 0"></path></svg>
          Suggestions
        </button>
      `;

      controlsContainer.appendChild(controls);

      // Add event listeners
      const newChatBtn = document.getElementById('new-chat-btn');
      const historyBtn = document.getElementById('history-btn');
      const suggestionsBtn = document.getElementById('suggestions-btn');

      if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
          onNewChat();
        });
      }

      if (historyBtn) {
        historyBtn.addEventListener('click', () => {
          onToggleSidebar();
        });
      }

      if (suggestionsBtn) {
        suggestionsBtn.addEventListener('click', () => {
          // For simplicity, just use a default prompt
          onPromptSelect("What can you help me with today?");
        });
      }

      setInjected(true);

      // Clean up when component unmounts
      return () => {
        const container = document.getElementById('ai-assistant-controls-container');
        if (container) {
          container.remove();
        }
        setInjected(false);
      };
    }
  }, [isAIAssistantPage, injected, onNewChat, onPromptSelect, onToggleSidebar]);

  // This component doesn't render anything visible
  return null;
}
