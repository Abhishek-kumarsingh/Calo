'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, FileText, ListChecks, Code, FileCode } from 'lucide-react';

interface QuestionTypeDistribution {
  text: number;
  multipleChoice: number;
  coding: number;
  codeCorrection: number;
}

interface QuestionTypes {
  text: boolean;
  multipleChoice: boolean;
  coding: boolean;
  codeCorrection: boolean;
}

interface QuestionTypeSelectorProps {
  onQuantityChange: (quantity: number) => void;
  onTypesChange: (types: QuestionTypes) => void;
  onDistributionChange: (distribution: QuestionTypeDistribution) => void;
  initialQuantity?: number;
  initialTypes?: QuestionTypes;
  initialDistribution?: QuestionTypeDistribution;
}

export function QuestionTypeSelector({
  onQuantityChange,
  onTypesChange,
  onDistributionChange,
  initialQuantity = 5,
  initialTypes = { text: true, multipleChoice: false, coding: false, codeCorrection: false },
  initialDistribution = { text: 100, multipleChoice: 0, coding: 0, codeCorrection: 0 }
}: QuestionTypeSelectorProps) {
  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [types, setTypes] = useState<QuestionTypes>(initialTypes);
  const [distribution, setDistribution] = useState<QuestionTypeDistribution>(initialDistribution);
  const [activeTab, setActiveTab] = useState<string>('basic');

  // Update distribution when types change
  useEffect(() => {
    const enabledTypes = Object.entries(types).filter(([_, enabled]) => enabled);
    
    if (enabledTypes.length === 0) {
      // If no types are selected, default to text
      setTypes(prev => ({ ...prev, text: true }));
      setDistribution({ text: 100, multipleChoice: 0, coding: 0, codeCorrection: 0 });
      return;
    }
    
    // Calculate even distribution
    const evenPercentage = Math.floor(100 / enabledTypes.length);
    const remainder = 100 - (evenPercentage * enabledTypes.length);
    
    // Create new distribution with even percentages for enabled types
    const newDistribution: QuestionTypeDistribution = {
      text: 0,
      multipleChoice: 0,
      coding: 0,
      codeCorrection: 0
    };
    
    enabledTypes.forEach(([type], index) => {
      // Add remainder to first type
      newDistribution[type as keyof QuestionTypeDistribution] = 
        index === 0 ? evenPercentage + remainder : evenPercentage;
    });
    
    setDistribution(newDistribution);
    onDistributionChange(newDistribution);
  }, [types]);

  // Handle quantity change
  const handleQuantityChange = (value: number) => {
    setQuantity(value);
    onQuantityChange(value);
  };

  // Handle type toggle
  const handleTypeToggle = (type: keyof QuestionTypes) => {
    const newTypes = { ...types, [type]: !types[type] };
    setTypes(newTypes);
    onTypesChange(newTypes);
  };

  // Handle distribution change
  const handleDistributionChange = (type: keyof QuestionTypeDistribution, value: number) => {
    // Ensure the type is enabled
    if (!types[type]) return;
    
    // Calculate the total of other enabled types
    const otherTypes = Object.keys(types).filter(t => 
      t !== type && types[t as keyof QuestionTypes]
    ) as Array<keyof QuestionTypeDistribution>;
    
    if (otherTypes.length === 0) {
      // If this is the only enabled type, it must be 100%
      const newDistribution = { ...distribution, [type]: 100 };
      setDistribution(newDistribution);
      onDistributionChange(newDistribution);
      return;
    }
    
    // Calculate how much to distribute among other types
    const remaining = 100 - value;
    const totalOtherPercentage = otherTypes.reduce(
      (sum, t) => sum + distribution[t], 0
    );
    
    // Create new distribution
    const newDistribution = { ...distribution, [type]: value };
    
    if (totalOtherPercentage > 0) {
      // Proportionally distribute the remaining percentage
      otherTypes.forEach(t => {
        const ratio = distribution[t] / totalOtherPercentage;
        newDistribution[t] = Math.round(remaining * ratio);
      });
      
      // Adjust for rounding errors
      const sum = Object.values(newDistribution).reduce((a, b) => a + b, 0);
      if (sum !== 100) {
        const diff = 100 - sum;
        newDistribution[otherTypes[0]] += diff;
      }
    } else {
      // Evenly distribute the remaining percentage
      const evenShare = Math.floor(remaining / otherTypes.length);
      const remainder = remaining - (evenShare * otherTypes.length);
      
      otherTypes.forEach((t, i) => {
        newDistribution[t] = i === 0 ? evenShare + remainder : evenShare;
      });
    }
    
    setDistribution(newDistribution);
    onDistributionChange(newDistribution);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Question Configuration
        </CardTitle>
        <CardDescription>
          Customize the number and types of questions for this interview
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="quantity" className="text-base font-medium">
                  Number of Questions: {quantity}
                </Label>
                <div className="flex items-center gap-4 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <Slider
                    id="quantity"
                    min={1}
                    max={20}
                    step={1}
                    value={[quantity]}
                    onValueChange={(values) => handleQuantityChange(values[0])}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuantityChange(Math.min(20, quantity + 1))}
                    disabled={quantity >= 20}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-base font-medium">Question Types</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="text" 
                      checked={types.text}
                      onCheckedChange={() => handleTypeToggle('text')}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="text" className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        Text Questions
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Open-ended questions requiring detailed explanations
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="multipleChoice" 
                      checked={types.multipleChoice}
                      onCheckedChange={() => handleTypeToggle('multipleChoice')}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="multipleChoice" className="flex items-center gap-1.5">
                        <ListChecks className="h-4 w-4 text-muted-foreground" />
                        Multiple Choice
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Questions with predefined options to choose from
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="coding" 
                      checked={types.coding}
                      onCheckedChange={() => handleTypeToggle('coding')}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="coding" className="flex items-center gap-1.5">
                        <Code className="h-4 w-4 text-muted-foreground" />
                        Coding Challenges
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Programming problems requiring code implementation
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="codeCorrection" 
                      checked={types.codeCorrection}
                      onCheckedChange={() => handleTypeToggle('codeCorrection')}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="codeCorrection" className="flex items-center gap-1.5">
                        <FileCode className="h-4 w-4 text-muted-foreground" />
                        Code Correction
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Identify and fix bugs in provided code snippets
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-6 pt-4">
            <div>
              <Label className="text-base font-medium mb-4 block">
                Question Type Distribution
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Adjust the percentage of each question type (total must equal 100%)
              </p>
              
              <div className="space-y-6">
                {Object.entries(types).map(([type, enabled]) => {
                  if (!enabled) return null;
                  
                  const typeKey = type as keyof QuestionTypeDistribution;
                  const typeLabels = {
                    text: 'Text Questions',
                    multipleChoice: 'Multiple Choice',
                    coding: 'Coding Challenges',
                    codeCorrection: 'Code Correction'
                  };
                  
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor={`dist-${type}`}>
                          {typeLabels[typeKey]}
                        </Label>
                        <span className="text-sm font-medium">
                          {distribution[typeKey]}%
                        </span>
                      </div>
                      <Slider
                        id={`dist-${type}`}
                        min={0}
                        max={100}
                        step={5}
                        value={[distribution[typeKey]]}
                        onValueChange={(values) => 
                          handleDistributionChange(typeKey, values[0])
                        }
                        disabled={Object.values(types).filter(Boolean).length <= 1}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
