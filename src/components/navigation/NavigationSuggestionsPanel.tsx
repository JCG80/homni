import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useNavigationSuggestions } from '@/hooks/navigation';
import { Lightbulb, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavigationSuggestionsPanelProps {
  className?: string;
  maxSuggestions?: number;
  showTitle?: boolean;
  compact?: boolean;
}

export const NavigationSuggestionsPanel: React.FC<NavigationSuggestionsPanelProps> = ({
  className,
  maxSuggestions = 5,
  showTitle = true,
  compact = false
}) => {
  const { suggestions } = useNavigationSuggestions();

  const displaySuggestions = suggestions.slice(0, maxSuggestions);

  if (displaySuggestions.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="warm-card">
        {showTitle && (
          <CardHeader className={cn('pb-3', compact && 'pb-2')}>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Lightbulb className="h-4 w-4 text-primary" />
              </div>
              Anbefalte neste steg
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className={cn('space-y-3', compact && 'space-y-2')}>
          <AnimatePresence>
            {displaySuggestions.map((suggestion, index) => {
              const Icon = suggestion.icon || ArrowRight;
              
              return (
                <motion.div
                  key={suggestion.href}
                  variants={itemVariants}
                  layout
                  className="group"
                >
                  <Button
                    asChild
                    variant="ghost"
                    className={cn(
                      'w-full justify-start h-auto p-3 hover:bg-accent/50',
                      compact && 'p-2'
                    )}
                  >
                    <Link to={suggestion.href}>
                      <div className="flex items-start gap-3 text-left w-full">
                        <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {suggestion.title}
                            </span>
                            {suggestion.badge && (
                              <Badge
                                variant={
                                  suggestion.badge.variant === 'warning' ? 'default' :
                                  suggestion.badge.variant === 'success' ? 'secondary' :
                                  suggestion.badge.variant
                                }
                                className="text-xs h-5"
                              >
                                {suggestion.badge.text}
                              </Badge>
                            )}
                          </div>
                          {suggestion.description && !compact && (
                            <p className="text-xs text-muted-foreground">
                              {suggestion.description}
                            </p>
                          )}
                        </div>
                        
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {suggestions.length > maxSuggestions && (
            <motion.div variants={itemVariants}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-primary"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Se flere forslag ({suggestions.length - maxSuggestions} til)
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};