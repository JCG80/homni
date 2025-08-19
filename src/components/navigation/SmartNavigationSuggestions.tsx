import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Clock, 
  Star, 
  TrendingUp, 
  Zap,
  ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SmartNavigationSuggestionsProps {
  className?: string;
  maxSuggestions?: number;
  showPerformanceMetrics?: boolean;
}

export const SmartNavigationSuggestions: React.FC<SmartNavigationSuggestionsProps> = ({
  className,
  maxSuggestions = 4,
  showPerformanceMetrics = false,
}) => {
  const {
    quickSuggestions,
    contextualSuggestions,
    navigationTime,
    cacheHitRate,
    frequentRoutes,
    navigateWithPreload,
  } = useSmartNavigation();

  const allSuggestions = [
    ...contextualSuggestions.map(s => ({ ...s, type: 'contextual' as const })),
    ...quickSuggestions.map(s => ({ ...s, type: 'quick' as const })),
  ].slice(0, maxSuggestions);

  const handleSuggestionClick = async (href: string, moduleId?: string) => {
    const startTime = performance.now();
    await navigateWithPreload(href, moduleId);
  };

  const getSuggestionIcon = (type: 'contextual' | 'quick') => {
    switch (type) {
      case 'contextual':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'quick':
        return <Zap className="h-4 w-4 text-green-500" />;
      default:
        return <ArrowRight className="h-4 w-4" />;
    }
  };

  const getSuggestionBadge = (type: 'contextual' | 'quick', href: string) => {
    if (type === 'contextual') {
      return <Badge variant="outline" className="text-xs">Neste steg</Badge>;
    }
    
    if (frequentRoutes.includes(href)) {
      return <Badge variant="outline" className="text-xs">
        <Star className="h-3 w-3 mr-1" />
        Favoritt
      </Badge>;
    }
    
    return null;
  };

  if (allSuggestions.length === 0) {
    return null;
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            Foreslåtte navigasjoner
          </h3>
          
          {showPerformanceMetrics && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{navigationTime.toFixed(0)}ms</span>
              <span>·</span>
              <span>{cacheHitRate}% cache</span>
            </div>
          )}
        </div>

        {/* Suggestions */}
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {allSuggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ 
                  duration: 0.2, 
                  delay: index * 0.05 
                }}
              >
                <Button
                  variant="ghost"
                  asChild
                  className={cn(
                    "w-full justify-start h-auto p-3",
                    "hover:bg-accent/50 transition-colors group"
                  )}
                >
                  <Link
                    to={suggestion.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSuggestionClick(suggestion.href);
                    }}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        {suggestion.icon ? (
                          <suggestion.icon className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          getSuggestionIcon(suggestion.type)
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">
                            {suggestion.title}
                          </span>
                          
                          {getSuggestionBadge(suggestion.type, suggestion.href)}
                        </div>
                        
                        {/* Description if available */}
                        {suggestion.description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {suggestion.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Arrow */}
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* Quick access note */}
        {quickSuggestions.length > 0 && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>Basert på din navigasjonshistorie</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SmartNavigationSuggestions;