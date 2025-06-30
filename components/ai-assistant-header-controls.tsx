'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { AIAssistantControls } from './ai-assistant-controls';

interface AIAssistantHeaderControlsProps {
  onPromptSelect: (prompt: string) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
}

export function AIAssistantHeaderControls({
  onPromptSelect,
  onNewChat,
  onToggleSidebar
}: AIAssistantHeaderControlsProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLElement | null>(null);
  
  // Only show controls on the AI Assistant page
  const isAIAssistantPage = pathname === '/dashboard/ai-assistant' || 
                           pathname?.startsWith('/dashboard/ai-assistant/');
  
  useEffect(() => {
    // Find the container in the dashboard header
    containerRef.current = document.querySelector('.dashboard-header-controls');
    
    // Force a re-render when the container is found
    if (containerRef.current) {
      // This is just to trigger a re-render
      const forceUpdate = () => {};
      forceUpdate();
    }
  }, []);
  
  if (!isAIAssistantPage || !containerRef.current) {
    return null;
  }
  
  // Use createPortal to render the controls in the dashboard header
  return createPortal(
    <AIAssistantControls
      onPromptSelect={onPromptSelect}
      onNewChat={onNewChat}
      onToggleSidebar={onToggleSidebar}
    />,
    containerRef.current
  );
}
