/**
 * EnhancedMobileNavigation - Advanced mobile navigation with gestures and native feel
 * Part of Phase 3B Step 3: Unified Navigation Experience
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, PanInfo } from 'framer-motion';
import { NavigationItem } from '@/types/consolidated-types';
import { useUnifiedNavigation } from '@/hooks/useUnifiedNavigation';
import { NavigationPatterns } from '@/lib/navigation/NavigationPatterns';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

interface EnhancedMobileNavigationProps {
  className?: string;
  onItemClick?: () => void;
  enableGestures?: boolean;
}

export const EnhancedMobileNavigation: React.FC<EnhancedMobileNavigationProps> = ({
  className = '',
  onItemClick,
  enableGestures = true
}) => {
  const { navigation, isLoading } = useUnifiedNavigation();
  const location = useLocation();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState(0);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);

  // Transform navigation for mobile
  const mobileItems = NavigationPatterns.transformForMobile(navigation.primary);
  const quickActions = navigation.quickActions.slice(0, 3);

  // Handle swipe gestures
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!enableGestures) return;

    const threshold = 50;
    if (Math.abs(info.velocity.x) > threshold) {
      if (info.velocity.x > 0 && activeTab > 0) {
        setActiveTab(activeTab - 1);
      } else if (info.velocity.x < 0 && activeTab < mobileItems.length - 1) {
        setActiveTab(activeTab + 1);
      }
    }
    setDragDirection(null);
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!enableGestures) return;
    
    if (Math.abs(info.offset.x) > 10) {
      setDragDirection(info.offset.x > 0 ? 'right' : 'left');
    }
  };

  // Check if a path is active
  const isActive = (href: string): boolean => {
    if (href === '/' && location.pathname === '/') return true;
    if (href === '/') return false;
    return location.pathname.startsWith(href);
  };

  // Handle item click with haptic feedback (if supported)
  const handleItemClick = (item: NavigationItem) => {
    // Haptic feedback for supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    onItemClick?.();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.nav
      className={`bg-background/95 backdrop-blur-sm border-t border-border ${className}`}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Quick Actions Row */}
      {quickActions.length > 0 && (
        <div className="flex justify-around items-center px-4 py-2 border-b border-border/50">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              to={action.href}
              onClick={() => handleItemClick(action)}
              className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-muted/50 transition-colors min-w-0"
            >
              {action.icon && (
                <div className="h-5 w-5 mb-1 text-muted-foreground">
                  {typeof action.icon === 'function' ? React.createElement(action.icon, { className: "h-5 w-5" }) : action.icon}
                </div>
              )}
              <span className="text-xs text-muted-foreground truncate max-w-[60px]">
                {action.title}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Main Navigation */}
      <motion.div
        className="flex justify-around items-center px-2 py-3"
        drag={enableGestures ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{
          x: dragDirection === 'left' ? -5 : dragDirection === 'right' ? 5 : 0
        }}
      >
        {mobileItems.map((item, index) => {
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => handleItemClick(item)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 max-w-[80px] relative ${
                active 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {/* Icon */}
              {item.icon && (
                <motion.div 
                  className="h-6 w-6 mb-1 relative"
                  animate={{ scale: active ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {typeof item.icon === 'function' ? React.createElement(item.icon, { 
                    className: `h-6 w-6 ${active ? 'text-primary' : ''}` 
                  }) : item.icon}
                  
                  {/* Badge indicator */}
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </motion.div>
              )}
              
              {/* Label */}
              <span className={`text-xs font-medium truncate max-w-full ${
                active ? 'text-primary' : ''
              }`}>
                {item.title}
              </span>
              
              {/* Active indicator */}
              {active && (
                <motion.div
                  className="absolute bottom-0 h-0.5 bg-primary rounded-full"
                  layoutId="activeIndicator"
                  initial={{ width: 0 }}
                  animate={{ width: '60%' }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
            </Link>
          );
        })}
      </motion.div>

      {/* Gesture hint */}
      {enableGestures && dragDirection && (
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-background/90 px-2 py-1 rounded"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {dragDirection === 'left' ? '← Swipe left' : 'Swipe right →'}
        </motion.div>
      )}
    </motion.nav>
  );
};