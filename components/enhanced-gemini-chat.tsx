'use client';

import React, { useState, useRef, useEffect, useImperativeHandle } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { LoadingDots } from './ai-loading-dots';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { chatSessionApi } from '@/lib/api-utils-updated';
import { TypewriterEffect } from './typewriter-effect';
import {
  Send,
  Sparkles,
  Brain,
  MessageSquare,
  Code,
  Image as ImageIcon,
  FileText,
  Copy,
  Check,
  AlertCircle,
  Lightbulb,
  Trash2,
  Mic,
  MicOff,
  Maximize2,
  Clock,
  History,
  Plus,
  MoreVertical,
  Edit,
  Minimize2,
  ThumbsUp,
  ThumbsDown,
  Paperclip,
  Camera,
  ChevronRight,
  ChevronLeft,
  Zap,
  Wand2
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

// Sample conversation starters
const CONVERSATION_STARTERS = [
  {
    title: "Interview Preparation",
    description: "Get help preparing for job interviews",
    icon: MessageSquare,
    prompt: "Help me prepare for a frontend developer interview. What are the most common questions and how should I answer them?"
  },
  {
    title: "Code Debugging",
    description: "Get help fixing code issues",
    icon: Code,
    prompt: "Debug this React code: function Component() { const [count, setCount] = useState(0); useEffect(() => { setCount(count + 1) }, [count]); return <div>{count}</div>; }"
  },
  {
    title: "Content Creation",
    description: "Generate creative content",
    icon: FileText,
    prompt: "Write a compelling product description for a new smart water bottle that tracks hydration and syncs with fitness apps."
  },
  {
    title: "Learning Assistant",
    description: "Learn new concepts and skills",
    icon: Brain,
    prompt: "Explain how blockchain technology works and its real-world applications beyond cryptocurrency."
  }
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative';
  isTyping?: boolean;
}

interface EnhancedGeminiChatProps {
  initialPrompt?: string | null;
  initialSidebarOpen?: boolean;
  ref?: React.ForwardedRef<{
    createNewChatSession: () => Promise<void>;
    setSidebarOpen: (open: boolean) => void;
  }>;
}

export const EnhancedGeminiChat = React.forwardRef<
  { createNewChatSession: () => Promise<void>; setSidebarOpen: (open: boolean) => void },
  EnhancedGeminiChatProps
>(({ initialPrompt, initialSidebarOpen = true }, ref) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestionCategory, setSuggestionCategory] = useState<keyof typeof PROMPT_SUGGESTIONS>('general');
  const [copied, setCopied] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(initialSidebarOpen);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Expose methods to parent component through ref
  useImperativeHandle(ref, () => ({
    createNewChatSession,
    setSidebarOpen: (open: boolean) => setSidebarOpen(open)
  }));

  // Load chat sessions and current session on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      await loadChatSessions();

      // Check if there's a saved session ID in localStorage
      const savedSessionId = localStorage.getItem('currentChatSessionId');
      if (savedSessionId) {
        try {
          await loadChatSession(savedSessionId);
        } catch (error) {
          console.error('Error loading saved chat session:', error);
          // If the saved session can't be loaded, clear it from localStorage
          localStorage.removeItem('currentChatSessionId');
        }
      }
    };

    loadInitialData();
  }, []);

  // Handle initialPrompt from props
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() !== '') {
      // Submit the initial prompt
      const event = new Event('submit') as unknown as React.FormEvent;
      handleSubmit(event, initialPrompt);
    }
  }, [initialPrompt]);

  // Load chat sessions from the database
  const loadChatSessions = async () => {
    try {
      setLoadingSessions(true);
      const sessions = await chatSessionApi.getChatSessions();
      setChatSessions(sessions);
      setLoadingSessions(false);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      setLoadingSessions(false);
    }
  };

  // Load a specific chat session
  const loadChatSession = async (sessionId: string) => {
    try {
      setLoading(true);
      const session = await chatSessionApi.getChatSession(sessionId);

      if (session && session.messages) {
        // Convert the messages to the format expected by the component
        const formattedMessages = session.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          feedback: msg.feedback
        }));

        setMessages(formattedMessages);
        setCurrentSessionId(sessionId);

        // Save the current session ID to localStorage for persistence
        localStorage.setItem('currentChatSessionId', sessionId);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading chat session:', error);
      setLoading(false);
    }
  };

  // Create a new chat session
  const createNewChatSession = async () => {
    try {
      setLoading(true);
      setError('');

      // Clear the current messages
      setMessages([]);

      try {
        // Create a new chat session in the database
        const newSession = await chatSessionApi.createChatSession({
          title: 'New Chat'
        });

        // Update the current session ID
        setCurrentSessionId(newSession.id);

        // Save the new session ID to localStorage for persistence
        localStorage.setItem('currentChatSessionId', newSession.id);

        // Refresh the chat sessions list
        await loadChatSessions();

        console.log('New chat session created:', newSession.id);
        return newSession;
      } catch (apiError) {
        console.error('API Error creating new chat session:', apiError);
        // If API fails, still create a local session
        console.log('Creating local-only chat session');
        // We'll just use a local session without saving to the database
      }

      setLoading(false);
    } catch (error) {
      console.error('Error creating new chat session:', error);
      setLoading(false);
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent, submittedPrompt?: string) => {
    e.preventDefault();
    const promptToSend = submittedPrompt || prompt;
    if (!promptToSend.trim()) return;

    // Create a new chat session if none exists
    if (!currentSessionId) {
      try {
        const newSession = await chatSessionApi.createChatSession({
          title: promptToSend.substring(0, 30) + (promptToSend.length > 30 ? '...' : ''),
          initialMessage: promptToSend
        });

        setCurrentSessionId(newSession.id);
        await loadChatSessions();

        // If the session was created with an initial message, the API already added the messages
        if (newSession.messages && newSession.messages.length > 0) {
          const formattedMessages = newSession.messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            feedback: msg.feedback
          }));

          setMessages(formattedMessages);
          setLoading(false);
          setError('');
          setPrompt('');
          return;
        }
      } catch (error) {
        console.error('Error creating new chat session:', error);
        // Continue with local-only chat if session creation fails
      }
    }

    // Add user message immediately
    const userMessage: Message = {
      role: 'user',
      content: promptToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError('');
    setPrompt('');

    try {
      // Call the Next.js API route
      console.log("Sending prompt to Next.js API route:", promptToSend);

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptToSend
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('API response error:', data);

        // Extract the most useful error message
        let errorMessage =
          data.message ||
          data.error ||
          (data.details && (data.details.message || JSON.stringify(data.details))) ||
          `Failed to get response from Gemini API (Status: ${res.status})`;

        // Check for specific error conditions
        if (errorMessage.includes('API key not valid') || errorMessage.includes('Invalid API key')) {
          errorMessage = 'The Gemini API key is invalid. Please update it in the .env file with a valid key from https://makersuite.google.com/app/apikey';
        } else if (errorMessage.includes('API key not configured')) {
          errorMessage = 'The Gemini API key is missing. Please add it to the .env file. Get your key from https://makersuite.google.com/app/apikey';
        }

        throw new Error(errorMessage);
      }

      // Log the response for debugging
      console.log('Gemini API response data:', data);

      // Extract the text from the Gemini API response
      let responseText;
      let modelUsed = data.model || 'gemini-1.5-flash';

      // Check for different response formats
      if (data.text) {
        // Our simplified API format
        responseText = data.text;
        console.log('Using text from simplified API format');
      } else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        // Standard Gemini API v1beta format
        responseText = data.candidates[0].content.parts[0].text;
        console.log('Using text from standard Gemini API v1beta format');
      } else if (data.content?.parts?.[0]?.text) {
        // Another possible format
        responseText = data.content.parts[0].text;
        console.log('Using text from content.parts format');
      } else if (data.originalResponse?.candidates?.[0]?.content?.parts?.[0]?.text) {
        // Our API might wrap the original response
        responseText = data.originalResponse.candidates[0].content.parts[0].text;
        console.log('Using text from wrapped originalResponse');
      } else if (typeof data === 'string') {
        // Sometimes the response might be a plain string
        responseText = data;
        console.log('Using text from string response');
      } else {
        // If we can't find the text in any expected format, log the full response and use a default message
        console.error('Unexpected Gemini API response format:', data);

        // Try to extract text from any property that might contain it
        const possibleTextProperties = [
          data.message,
          data.response,
          data.answer,
          data.result,
          data.output,
          data.generated_text,
          data.generatedText
        ];

        const foundText = possibleTextProperties.find(prop => typeof prop === 'string' && prop.length > 0);

        if (foundText) {
          responseText = foundText;
          console.log('Found text in alternative property:', foundText);
        } else {
          responseText = 'Sorry, I received a response in an unexpected format. Please try again.';
        }
      }

      console.log('Extracted response text from model:', modelUsed);
      console.log('Response text:', responseText);

      const assistantMessage: Message = {
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        isTyping: true
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save the message to the chat session if we have a session ID
      if (currentSessionId) {
        try {
          // Add the message to the chat session
          const response = await chatSessionApi.addMessage(currentSessionId, promptToSend);

          // If we got a response with both user message and AI response, update our messages
          if (response && response.userMessage && response.aiResponse) {
            // Replace the last two messages (our local ones) with the ones from the server
            // This ensures we have the correct IDs and timestamps from the database
            setMessages(prev => {
              const messagesWithoutLast = prev.slice(0, -2);
              return [
                ...messagesWithoutLast,
                {
                  role: 'user',
                  content: response.userMessage.content,
                  timestamp: new Date(response.userMessage.timestamp)
                },
                {
                  role: 'assistant',
                  content: response.aiResponse.content,
                  timestamp: new Date(response.aiResponse.timestamp)
                }
              ];
            });
          }

          // Refresh the chat sessions list to update the lastUpdated timestamp
          loadChatSessions();
        } catch (error) {
          console.error('Error saving message to chat session:', error);
          // Continue with local-only chat if saving fails
        }
      }
    } catch (err: any) {
      // Enhanced error handling with more details
      console.error('Error calling Gemini API:', err);

      // Try to extract more detailed error information
      let errorMessage = 'An error occurred while communicating with the AI service';

      if (err.message) {
        errorMessage = err.message;
      }

      // If the error contains details property (from our API)
      if (err.details) {
        console.error('Error details:', err.details);
        if (typeof err.details === 'object') {
          errorMessage += ': ' + (err.details.message || JSON.stringify(err.details));
        } else {
          errorMessage += ': ' + err.details;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopied(`${index}`);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClearConversation = async () => {
    setMessages([]);
    setPrompt('');
    setError('');

    // Clear the current session ID from localStorage
    localStorage.removeItem('currentChatSessionId');

    // Create a new chat session
    if (currentSessionId) {
      setCurrentSessionId(null);
      await createNewChatSession();
    }
  };

  const handlePromptSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFeedback = async (index: number, type: 'positive' | 'negative') => {
    setMessages(prev =>
      prev.map((msg, i) =>
        i === index ? { ...msg, feedback: type } : msg
      )
    );

    // Save feedback to the chat session if we have a session ID
    if (currentSessionId) {
      try {
        await chatSessionApi.updateChatSession(currentSessionId, {
          messageIndex: index,
          feedback: type
        });
      } catch (error) {
        console.error('Error saving feedback to chat session:', error);
      }
    }
  };

  const toggleRecording = () => {
    // In a real implementation, this would start/stop voice recording
    setRecording(!recording);
    if (!recording) {
      // Simulate starting recording
      setTimeout(() => {
        setRecording(false);
        setPrompt("This is a transcribed voice message. In a real implementation, this would be the text converted from your voice input.");
      }, 3000);
    }
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
    // In a real implementation, you might want to use the Fullscreen API
  };

  return (
    <div className="w-full h-full flex">
      {/* Chat History Sidebar */}
      <div className={`h-full border-r bg-background transition-all duration-300 ${sidebarOpen ? 'w-[260px]' : 'w-0'}`}>
        {sidebarOpen && (
          <div className="h-full flex flex-col p-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Chat History</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="h-7 w-7"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              {loadingSessions ? (
                <div className="flex justify-center items-center py-8">
                  <LoadingDots className="text-purple-500" />
                </div>
              ) : chatSessions.length === 0 ? (
                <div className="text-center py-4 px-2">
                  <p className="text-sm text-muted-foreground">No chat history yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Start a new conversation</p>
                </div>
              ) : (
                chatSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${
                      currentSessionId === session.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => loadChatSession(session.id)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm truncate font-medium">{session.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(session.lastUpdated || session.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Removed sidebar toggle button as it's now in the navbar */}

        {/* Chat Messages Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6 md:px-6"
          style={{ height: 'calc(100vh - 140px)' }}
        >
          {messages.length === 0 && !loading && !error ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-6"
              >
                <Sparkles className="h-8 w-8 text-purple-500" />
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h3 className="text-xl font-medium mb-3">How can I help you today?</h3>
                <p className="text-muted-foreground max-w-md mb-8">
                  Ask me anything, request creative content, solve problems, or try one of the conversation starters below.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                {CONVERSATION_STARTERS.map((starter, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (index * 0.1) }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 flex items-start gap-3 text-left border hover:bg-muted/20"
                      onClick={(e) => handleSubmit(e, starter.prompt)}
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <starter.icon className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium">{starter.title}</p>
                        <p className="text-xs text-muted-foreground">{starter.description}</p>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
                  <div className="space-y-6 py-4">
                    <AnimatePresence>
                      {messages.map((message, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="group"
                        >
                          <div className={`flex gap-3 ${message.role === 'assistant' ? 'mb-6' : 'mb-4'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                              message.role === 'user'
                                ? 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30'
                                : 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30'
                            }`}>
                              {message.role === 'user' ? (
                                <span className="text-blue-700 dark:text-blue-400 text-sm font-semibold">You</span>
                              ) : (
                                <Sparkles className="h-5 w-5 text-purple-700 dark:text-purple-400" />
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-sm font-semibold">
                                  {message.role === 'user' ? 'You' : 'Gemini AI'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <div className={`relative rounded-lg p-4 shadow-sm ${
                                message.role === 'user'
                                  ? 'bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-900/10 dark:to-blue-900/5 text-foreground border border-blue-100 dark:border-blue-800/20'
                                  : 'bg-gradient-to-r from-purple-50 to-purple-50/50 dark:from-purple-900/10 dark:to-purple-900/5 text-foreground border border-purple-100 dark:border-purple-800/20'
                              }`}>
                                {message.role === 'assistant' ? (
                                  <div className="prose prose-sm dark:prose-invert max-w-none break-words overflow-hidden">
                                    {message.isTyping ? (
                                      <TypewriterEffect
                                        text={message.content}
                                        speed={20}
                                        onComplete={() => {
                                          setMessages(prev =>
                                            prev.map((msg, i) =>
                                              i === index ? { ...msg, isTyping: false } : msg
                                            )
                                          );
                                        }}
                                      />
                                    ) : (
                                      <ReactMarkdown
                                        components={{
                                          code: ({ node, inline, className, children, ...props }: any) => {
                                            const match = /language-(\w+)/.exec(className || '')
                                            return !inline && match ? (
                                              <div className="max-w-full overflow-x-auto">
                                                <SyntaxHighlighter
                                                  style={vscDarkPlus}
                                                  language={match[1]}
                                                  PreTag="div"
                                                  wrapLines={true}
                                                  wrapLongLines={true}
                                                  customStyle={{ maxWidth: '100%', overflowX: 'auto' }}
                                                  {...props}
                                                >{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
                                              </div>
                                            ) : (
                                              <code className={className} {...props}>
                                                {children}
                                              </code>
                                            )
                                          },
                                          pre: ({ node, ...props }) => (
                                            <pre className="overflow-x-auto max-w-full" {...props} />
                                          ),
                                          p: ({ node, ...props }) => (
                                            <p className="whitespace-pre-wrap break-words" {...props} />
                                          ),
                                          a: ({ node, ...props }) => (
                                            <a className="break-all" {...props} />
                                          ),
                                          ul: ({ node, ...props }) => (
                                            <ul className="list-disc pl-6 space-y-2" {...props} />
                                          ),
                                          ol: ({ node, ...props }) => (
                                            <ol className="list-decimal pl-6 space-y-2" {...props} />
                                          ),
                                          li: ({ node, ...props }) => (
                                            <li className="pl-1" {...props} />
                                          )
                                        }}
                                      >
                                        {message.content}
                                      </ReactMarkdown>
                                    )}
                                  </div>
                                ) : (
                                  <div className="whitespace-pre-wrap break-words overflow-hidden">
                                    {message.content.startsWith('1.') || message.content.startsWith('- ') ? (
                                      <ReactMarkdown
                                        components={{
                                          ul: ({ node, ...props }) => (
                                            <ul className="list-disc pl-6 space-y-2" {...props} />
                                          ),
                                          ol: ({ node, ...props }) => (
                                            <ol className="list-decimal pl-6 space-y-2" {...props} />
                                          ),
                                          li: ({ node, ...props }) => (
                                            <li className="pl-1" {...props} />
                                          )
                                        }}
                                      >
                                        {message.content}
                                      </ReactMarkdown>
                                    ) : (
                                      <p>{message.content}</p>
                                    )}
                                  </div>
                                )}

                                {/* Message actions */}
                                <div className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ${
                                  message.role === 'user' ? 'bg-blue-50/80 dark:bg-blue-900/30' : 'bg-purple-50/80 dark:bg-purple-900/30'
                                } backdrop-blur-sm rounded p-1`}>
                                  {message.role === 'assistant' && (
                                    <>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6"
                                        onClick={() => handleFeedback(index, 'positive')}
                                      >
                                        <ThumbsUp className={`h-3.5 w-3.5 ${message.feedback === 'positive' ? 'text-green-500 fill-green-500' : ''}`} />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6"
                                        onClick={() => handleFeedback(index, 'negative')}
                                      >
                                        <ThumbsDown className={`h-3.5 w-3.5 ${message.feedback === 'negative' ? 'text-red-500 fill-red-500' : ''}`} />
                                      </Button>
                                      <Separator orientation="vertical" className="h-4 my-auto" />
                                    </>
                                  )}
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    onClick={() => handleCopyMessage(message.content, index)}
                                  >
                                    {copied === `${index}` ? (
                                      <Check className="h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {/* Feedback confirmation */}
                              {message.role === 'assistant' && message.feedback && (
                                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                                  {message.feedback === 'positive' ? (
                                    <>
                                      <ThumbsUp className="h-3 w-3" />
                                      <span>Thanks for your feedback!</span>
                                    </>
                                  ) : (
                                    <>
                                      <ThumbsDown className="h-3 w-3" />
                                      <span>Thanks for your feedback. We will work to improve.</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Loading message */}
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex gap-3 mb-6">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">Gemini AI</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4">
                              <div className="flex items-center gap-3">
                                <LoadingDots className="text-purple-500" />
                                <p className="text-sm text-muted-foreground animate-pulse">Generating response...</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Error message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="h-4 w-4 text-red-700 dark:text-red-400" />
                          </div>

                          <div className="flex-1">
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg p-4 text-red-700 dark:text-red-400 text-sm flex items-start gap-2">
                              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                              <span>{error}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Invisible element to scroll to */}
                    <div ref={messagesEndRef} />
                  </div>
                )}
            </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-background fixed bottom-0 left-0 right-0" style={{ marginLeft: sidebarOpen ? '260px' : '0', transition: 'margin-left 0.3s' }}>
          <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute bottom-3 left-3 flex gap-1.5">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className={`h-8 w-8 rounded-full ${recording ? 'bg-red-100 text-red-500' : ''}`}
                  onClick={toggleRecording}
                >
                  {recording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>

              <Textarea
                ref={textareaRef}
                placeholder={recording ? "Listening..." : "Message Gemini AI..."}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="pl-[4.5rem] pr-16 min-h-[48px] max-h-[120px] resize-none py-3 bg-white dark:bg-gray-950 border border-muted-foreground/20 rounded-xl shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={recording}
              />

              <div className="absolute right-2 bottom-2">
                <Button
                  type="submit"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-purple-500 hover:bg-purple-600 text-white"
                  disabled={loading || (!prompt.trim() && !recording)}
                >
                  {loading ? (
                    <LoadingDots className="mx-2" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});