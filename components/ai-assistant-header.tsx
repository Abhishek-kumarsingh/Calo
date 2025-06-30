'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Zap, 
  Brain, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Lightbulb
} from 'lucide-react';

interface AIAssistantHeaderProps {
  title?: string;
  subtitle?: string;
  showBadge?: boolean;
  showExpandButton?: boolean;
  expanded?: boolean;
  onExpandToggle?: () => void;
}

export function AIAssistantHeader({
  title = "AI Assistant",
  subtitle = "Powered by Google's Gemini 2.0 Flash model",
  showBadge = true,
  showExpandButton = false,
  expanded = false,
  onExpandToggle
}: AIAssistantHeaderProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-start md:items-center gap-3">
          <motion.div
            className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <Sparkles className={`h-6 w-6 md:h-7 md:w-7 text-purple-500 transition-all duration-300 ${isHovered ? 'text-purple-600' : ''}`} />
          </motion.div>
          
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
              {showBadge && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  <Zap className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Info className="h-4 w-4" />
            Help
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Brain className="h-4 w-4" />
            Features
          </Button>
          {showExpandButton && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onExpandToggle}
              className="gap-1.5"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Expand
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Optional feature highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Sparkles, text: "Smart Responses", color: "text-purple-500" },
          { icon: Zap, text: "Fast Processing", color: "text-amber-500" },
          { icon: Brain, text: "Advanced AI", color: "text-blue-500" },
          { icon: Lightbulb, text: "Helpful Suggestions", color: "text-green-500" }
        ].map((feature, index) => (
          <div 
            key={index}
            className="flex items-center gap-2 p-2 rounded-lg border bg-card/50"
          >
            <feature.icon className={`h-4 w-4 ${feature.color}`} />
            <span className="text-sm font-medium">{feature.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
