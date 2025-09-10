import React, { useState, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { ChevronUp, Compass, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SmartNavigationSuggestions } from '@/components/navigation/SmartNavigationSuggestions';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';
import { cn } from '@/lib/utils';

interface MobileNavigationEnhancementsProps {
  className?: string;
}

export const MobileNavigationEnhancements: React.FC<MobileNavigationEnhancementsProps> = ({
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { quickSuggestions } = useSmartNavigation();

  // Auto-hide after inactivity
  useEffect(() => {
    if (isExpanded) {
      const timeout = setTimeout(() => {
        setIsExpanded(false);
      }, 10000); // Hide after 10 seconds

      return () => clearTimeout(timeout);
    }
  }, [isExpanded]);

  if (!quickSuggestions.length) return null;

  return (
    <motion.div
      className={cn(
        "fixed bottom-20 left-4 right-4 z-30 md:hidden",
        className
      )}
      initial={false}
      animate={{
        y: isExpanded ? 0 : 100,
        opacity: isExpanded ? 1 : 0.8,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card className="bg-background/95 backdrop-blur-sm border shadow-lg">
        {/* Expand/Collapse Handle */}
        <div className="flex justify-center py-2 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <Compass className="h-3 w-3" />
            <span className="text-xs">Smart Navigation</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronUp className="h-3 w-3" />
            </motion.div>
          </Button>
        </div>

        {/* Smart Suggestions Content */}
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <SmartNavigationSuggestions
              maxSuggestions={3}
              className="border-none shadow-none bg-transparent"
            />
          </motion.div>
        )}

        {/* Collapsed State - Quick Preview */}
        {!isExpanded && quickSuggestions.length > 0 && (
          <div className="p-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" />
              <span>{quickSuggestions.length} navigation suggestions</span>
            </div>
          </div>
        )}
      </Card>

      {/* Swipe up indicator when collapsed */}
      {!isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-2 left-1/2 -translate-x-1/2"
        >
          <div className="w-8 h-1 bg-muted-foreground/30 rounded-full" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default MobileNavigationEnhancements;