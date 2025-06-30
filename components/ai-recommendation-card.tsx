'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ThumbsUp, 
  ThumbsDown, 
  AlertCircle, 
  Lightbulb, 
  ArrowRight, 
  BookOpen,
  Code,
  Brain,
  Sparkles
} from 'lucide-react';

type RecommendationType = 'positive' | 'negative' | 'neutral' | 'coding' | 'learning' | 'creative';

interface AIRecommendation {
  type: RecommendationType;
  title: string;
  description: string;
  action?: string;
}

interface AIRecommendationCardProps {
  recommendations: AIRecommendation[];
  onActionClick?: (recommendation: AIRecommendation) => void;
}

export function AIRecommendationCard({ recommendations, onActionClick }: AIRecommendationCardProps) {
  // Get icon based on recommendation type
  const getIcon = (type: RecommendationType) => {
    switch (type) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      case 'neutral':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'coding':
        return <Code className="h-4 w-4 text-blue-500" />;
      case 'learning':
        return <Brain className="h-4 w-4 text-purple-500" />;
      case 'creative':
        return <Sparkles className="h-4 w-4 text-pink-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-amber-500" />;
    }
  };

  // Get badge variant based on recommendation type
  const getBadgeVariant = (type: RecommendationType) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'negative':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'neutral':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'coding':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'learning':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'creative':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-purple-500" />
          AI Recommendations
        </CardTitle>
        <CardDescription>
          Personalized suggestions based on your interactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((recommendation, index) => (
            <div 
              key={index} 
              className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                {getIcon(recommendation.type)}
                <Badge variant="outline" className={getBadgeVariant(recommendation.type)}>
                  {recommendation.type.charAt(0).toUpperCase() + recommendation.type.slice(1)}
                </Badge>
              </div>
              <h3 className="font-medium mb-1">{recommendation.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {recommendation.description}
              </p>
              {recommendation.action && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-between items-center text-xs"
                  onClick={() => onActionClick && onActionClick(recommendation)}
                >
                  {recommendation.action}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
