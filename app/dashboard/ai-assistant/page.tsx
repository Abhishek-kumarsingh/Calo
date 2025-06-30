"use client";

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { EnhancedGeminiChat } from '@/components/enhanced-gemini-chat';

export default function AIAssistantPage() {
  const searchParams = useSearchParams();
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatRef = useRef<any>(null);

  // Check if we need to create a new chat (from URL parameter)
  useEffect(() => {
    const newChat = searchParams.get('new');
    if (newChat === 'true' && chatRef.current && chatRef.current.createNewChatSession) {
      chatRef.current.createNewChatSession();
    }
  }, [searchParams]);

  // Handle sidebar toggle from the header
  useEffect(() => {
    // Add event listener for the History button in the header
    const historyBtn = document.getElementById('history-btn');

    if (historyBtn) {
      const handleHistoryClick = () => {
        setSidebarOpen(!sidebarOpen);
        if (chatRef.current && chatRef.current.setSidebarOpen) {
          chatRef.current.setSidebarOpen(!sidebarOpen);
        }
      };

      historyBtn.addEventListener('click', handleHistoryClick);
      return () => {
        historyBtn.removeEventListener('click', handleHistoryClick);
      };
    }
  }, [sidebarOpen]);

  // Handle suggestions from the header
  useEffect(() => {
    // Add event listener for the Suggestions button in the header
    const suggestionsBtn = document.getElementById('suggestions-btn');

    if (suggestionsBtn) {
      const handleSuggestionsClick = () => {
        const suggestions = [
          "Explain quantum computing in simple terms",
          "What are the most effective ways to reduce stress?",
          "Tell me about the latest advancements in renewable energy",
          "How does machine learning work?"
        ];
        // Pick a random suggestion
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        setSelectedPrompt(randomSuggestion);
      };

      suggestionsBtn.addEventListener('click', handleSuggestionsClick);
      return () => {
        suggestionsBtn.removeEventListener('click', handleSuggestionsClick);
      };
    }
  }, []);

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden">
      <EnhancedGeminiChat
        ref={chatRef}
        initialPrompt={selectedPrompt}
        initialSidebarOpen={sidebarOpen}
      />
    </div>
  );
}