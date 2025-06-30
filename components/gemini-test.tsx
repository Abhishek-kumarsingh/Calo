'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { LoadingDots } from './ai-loading-dots';
import { 
  Send, 
  Sparkles, 
  Brain, 
  MessageSquare, 
  Code, 
  Image, 
  FileText, 
  RefreshCw, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle,
  Lightbulb,
  Trash2
} from 'lucide-react';

// Sample prompt suggestions
const PROMPT_SUGGESTIONS = [
  "Explain quantum computing in simple terms",
  "Write a short story about a robot learning to feel emotions",
  "Create a JavaScript function to sort an array of objects by a property",
  "What are the best practices for sustainable web development?",
  "Generate a marketing plan for a new eco-friendly product",
  "Explain the differences between REST and GraphQL APIs"
];

export function GeminiTest() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [conversations, setConversations] = useState<{prompt: string, response: string}[]>([]);
  const [copied, setCopied] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  // Scroll to response when it's received
  useEffect(() => {
    if (response && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [response]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response from Gemini API');
      }

      // Extract the text from the Gemini API response
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text found';
      setResponse(responseText);
      
      // Add to conversation history
      setConversations([...conversations, { prompt, response: responseText }]);
      
      // Clear prompt after successful response
      setPrompt('');
      
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error calling Gemini API:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClearConversation = () => {
    setConversations([]);
    setResponse('');
    setPrompt('');
    setError('');
  };

  const handlePromptSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Sparkles className="h-6 w-6 text-purple-500" />
                    Gemini AI Assistant
                  </CardTitle>
                  <CardDescription className="mt-1.5">
                    Powered by New generation AI
                  </CardDescription>
                </div>
                <Badge variant="outline" className="px-3 py-1 bg-purple-50">
                  <Brain className="h-3.5 w-3.5 mr-1 text-purple-500" />
                  <span className="text-xs font-medium">AI Powered</span>
                </Badge>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chat" className="flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="code" className="flex items-center gap-1.5">
                    <Code className="h-4 w-4" />
                    Code Assistant
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto pb-0">
              <TabsContent value="chat" className="mt-0 h-full">
                <div className="space-y-6 min-h-[300px]">
                  {conversations.length === 0 && !response && !loading && !error ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center p-6">
                      <Sparkles className="h-12 w-12 text-purple-200 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Start a conversation with Gemini</h3>
                      <p className="text-muted-foreground max-w-md">
                        Ask questions, get creative content, solve problems, or try one of the suggestions below.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 w-full max-w-lg">
                        {PROMPT_SUGGESTIONS.slice(0, 4).map((suggestion, index) => (
                          <Button 
                            key={index} 
                            variant="outline" 
                            className="justify-start h-auto py-2 px-3 text-left text-sm"
                            onClick={() => handlePromptSuggestion(suggestion)}
                          >
                            <Lightbulb className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-purple-500" />
                            <span className="truncate">{suggestion}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {conversations.map((conv, index) => (
                        <div key={index} className="space-y-4">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-700 text-sm font-semibold">You</span>
                            </div>
                            <div className="flex-1">
                              <div className="prose prose-sm max-w-none">
                                <p>{conv.prompt}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <Sparkles className="h-4 w-4 text-purple-700" />
                            </div>
                            <div className="flex-1">
                              <div className="prose prose-sm max-w-none">
                                <div className="whitespace-pre-wrap">{conv.response}</div>
                              </div>
                            </div>
                          </div>
                          
                          {index < conversations.length - 1 && (
                            <Separator className="my-4" />
                          )}
                        </div>
                      ))}
                      
                      {/* Current response */}
                      {(response || loading || error) && (
                        <div className="space-y-4" ref={responseRef}>
                          {prompt && (
                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-700 text-sm font-semibold">You</span>
                              </div>
                              <div className="flex-1">
                                <div className="prose prose-sm max-w-none">
                                  <p>{prompt}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                              {loading ? (
                                <Loader2 className="h-4 w-4 text-purple-700 animate-spin" />
                              ) : (
                                <Sparkles className="h-4 w-4 text-purple-700" />
                              )}
                            </div>
                            <div className="flex-1">
                              {loading ? (
                                <div className="h-20 flex items-center">
                                  <div className="flex flex-col gap-4">
                                    <LoadingDots className="text-purple-500" />
                                    <p className="text-sm text-muted-foreground">Gemini is thinking...</p>
                                  </div>
                                </div>
                              ) : error ? (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm flex items-start gap-2">
                                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                  <span>{error}</span>
                                </div>
                              ) : response ? (
                                <div className="prose prose-sm max-w-none relative group">
                                  <div className="whitespace-pre-wrap">{response}</div>
                                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 w-8 p-0" 
                                      onClick={handleCopyResponse}
                                    >
                                      {copied ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="code" className="mt-0 h-full">
                <div className="flex flex-col items-center justify-center h-[300px] text-center p-6">
                  <Code className="h-12 w-12 text-purple-200 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Code Assistant</h3>
                  <p className="text-muted-foreground max-w-md">
                    Get help with coding problems, generate code snippets, or debug your existing code.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 w-full max-w-lg">
                    {PROMPT_SUGGESTIONS.slice(2, 4).map((suggestion, index) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        className="justify-start h-auto py-2 px-3 text-left text-sm"
                        onClick={() => {
                          handlePromptSuggestion(suggestion);
                          setActiveTab('chat');
                        }}
                      >
                        <Lightbulb className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-purple-500" />
                        <span className="truncate">{suggestion}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </CardContent>
            
            <CardFooter className="pt-4 pb-4 border-t mt-auto">
              <form onSubmit={handleSubmit} className="w-full">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Ask Gemini anything..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="pr-24 min-h-[60px] max-h-[200px] resize-none py-3 pl-4"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <div className="absolute right-2 bottom-2 flex gap-2">
                    {conversations.length > 0 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={handleClearConversation}
                        title="Clear conversation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      type="submit"
                      size="sm"
                      className="h-8 px-3"
                      disabled={loading || !prompt.trim()}
                    >
                      {loading ? (
                        <LoadingDots className="mx-2" />
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5 mr-1" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Shift + Enter for a new line. Enter to send.
                </p>
              </form>
            </CardFooter>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="w-full lg:w-64 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {PROMPT_SUGGESTIONS.map((suggestion, index) => (
                  <Button 
                    key={index} 
                    variant="ghost" 
                    className="w-full justify-start h-auto py-2 text-left text-sm"
                    onClick={() => handlePromptSuggestion(suggestion)}
                  >
                    <Lightbulb className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-purple-500" />
                    <span className="truncate">{suggestion}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Natural Conversations</p>
                    <p className="text-xs text-muted-foreground">Ask questions in a conversational way</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Code className="h-4 w-4 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Code Generation</p>
                    <p className="text-xs text-muted-foreground">Create and debug code in multiple languages</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Content Creation</p>
                    <p className="text-xs text-muted-foreground">Generate creative text formats like poems, stories, and more</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}