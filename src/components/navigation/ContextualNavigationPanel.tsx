import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useContextualNavigation } from '@/hooks/useContextualNavigation';
import { 
  Lightbulb, 
  ArrowRight, 
  Zap, 
  Navigation,
  MousePointer,
  Keyboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContextualNavigationPanelProps {
  className?: string;
  variant?: 'sidebar' | 'popup' | 'inline';
}

export function ContextualNavigationPanel({ 
  className, 
  variant = 'sidebar' 
}: ContextualNavigationPanelProps) {
  const { suggestions, quickActions, isLoading } = useContextualNavigation();
  
  const hasContent = suggestions.length > 0 || quickActions.length > 0;
  
  if (isLoading || !hasContent) {
    return null;
  }

  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500', 
    low: 'bg-green-500',
  };

  const categoryIcons = {
    navigation: Navigation,
    action: MousePointer,
    shortcut: Keyboard,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={className}
    >
      <Card className={variant === 'popup' ? 'shadow-lg border-primary/20' : ''}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Lightbulb className="h-4 w-4 text-primary" />
            Forslag til navigering
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Hurtighandlinger
              </h4>
              <div className="space-y-1">
                <AnimatePresence>
                  {quickActions.map((action, index) => {
                    const Icon = categoryIcons[action.category];
                    return (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={action.action}
                          className="w-full justify-start text-left h-auto p-2"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <Icon className="h-3 w-3 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium truncate">
                                {action.title}
                              </div>
                            </div>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </Button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}
          
          {/* Navigation Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                Anbefalte sider
              </h4>
              <div className="space-y-1">
                <AnimatePresence>
                  {suggestions.map((suggestion, index) => {
                    const Icon = categoryIcons[suggestion.category];
                    return (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: (quickActions.length + index) * 0.1 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={suggestion.action}
                          className="w-full justify-start text-left h-auto p-2"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className={`w-2 h-2 rounded-full ${priorityColors[suggestion.priority]}`} />
                              <Icon className="h-3 w-3 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium truncate">
                                  {suggestion.title}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {suggestion.description}
                                </div>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {suggestion.category}
                            </Badge>
                          </div>
                        </Button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}