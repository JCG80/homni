/**
 * Enhanced Mobile Navigation with Cross-Platform Sync
 * Optimized for mobile UX with gesture support and sync
 */

import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdaptiveNavigation } from '@/hooks/navigation/useAdaptiveNavigation';
import { useMobileNavigation } from '@/hooks/useUnifiedNavigation';
import { cn } from '@/lib/utils';
import { Home, Grid3X3, User, Settings, MoreHorizontal } from 'lucide-react';

interface EnhancedMobileNavigationProps {
  className?: string;
  onItemClick?: () => void;
}

export const EnhancedMobileNavigation: React.FC<EnhancedMobileNavigationProps> = ({
  className,
  onItemClick
}) => {
  const location = useLocation();
  const { items, quickActions, isLoading } = useMobileNavigation();
  const { 
    adaptiveConfig, 
    deviceContext, 
    shouldShowAnimation 
  } = useAdaptiveNavigation();

  if (isLoading) {
    return (
      <nav className={cn("flex justify-around p-2 bg-background border-t", className)}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center space-y-1">
            <div className="w-6 h-6 bg-muted animate-pulse rounded" />
            <div className="w-8 h-3 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </nav>
    );
  }

  // Limit mobile items to 5 for optimal UX
  const displayItems = items.slice(0, 5);
  
  // Add overflow menu if there are more items
  const hasOverflow = items.length > 5;

  return (
    <motion.nav 
      className={cn(
        "flex justify-around items-center p-2 bg-background border-t",
        "safe-area-inset-bottom", // Handle iPhone notch
        adaptiveConfig.navigationDensity === 'compact' && "p-1",
        className
      )}
      initial={shouldShowAnimation ? { y: 100, opacity: 0 } : false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {displayItems.map((item, index) => {
        const isActive = location.pathname === item.href || 
          (item.href !== '/' && location.pathname.startsWith(item.href));

        return (
          <motion.div
            key={item.href}
            whileTap={shouldShowAnimation ? { scale: 0.95 } : undefined}
            className="flex flex-col items-center min-w-0 flex-1"
          >
            <Button
              asChild
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center space-y-1 p-2 h-auto min-h-[48px]",
                "text-xs font-medium transition-colors duration-200",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              onClick={onItemClick}
            >
              <Link to={item.href} className="flex flex-col items-center space-y-1">
                <div className="relative">
                  {item.icon && typeof item.icon === 'function' && (
                    <item.icon className={cn(
                      "w-5 h-5 transition-transform duration-200",
                      isActive && "scale-110"
                    )} />
                  )}
                  
                  {/* Badge support */}
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                
                <span className={cn(
                  "text-[10px] leading-tight text-center truncate w-full max-w-[60px]",
                  adaptiveConfig.navigationDensity === 'compact' && "text-[9px]"
                )}>
                  {item.title}
                </span>
              </Link>
            </Button>
          </motion.div>
        );
      })}

      {/* Overflow menu for additional items */}
      {hasOverflow && (
        <motion.div
          whileTap={shouldShowAnimation ? { scale: 0.95 } : undefined}
          className="flex flex-col items-center min-w-0 flex-1"
        >
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center space-y-1 p-2 h-auto min-h-[48px] text-xs font-medium text-muted-foreground"
            onClick={() => {
              // Handle overflow menu - could open a sheet or dropdown
              console.log('Show more navigation items');
            }}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Mer</span>
          </Button>
        </motion.div>
      )}
    </motion.nav>
  );
};