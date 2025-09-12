import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { getNavigation } from '@/config/navigation-consolidated';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SwipeNavigationProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  children: React.ReactNode;
}

export const SwipeNavigation: React.FC<SwipeNavigationProps> = ({ 
  onSwipeLeft, 
  onSwipeRight, 
  children 
}) => {
  const dragThreshold = 50;

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;

    if (Math.abs(offset.x) > dragThreshold || Math.abs(velocity.x) > 500) {
      if (offset.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
};

export const MobileBottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  
  const navigation = getNavigation((role || 'guest') as any);
  const bottomNavItems = navigation.slice(0, 4); // Limit to 4 items for mobile

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border md:hidden z-40">
      <div className="flex justify-around items-center py-2">
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.href || 
                          (item.href !== '/' && location.pathname.startsWith(item.href));
          
          return (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.href)}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-3 h-auto",
                "text-xs font-medium transition-colors",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.icon && typeof item.icon === 'function' && React.createElement(item.icon as any, { className: 'h-5 w-5' })}
              <span className="truncate max-w-12">{item.title}</span>
              {item.badge && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full px-1 min-w-4 h-4 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export const MobileNavigationGestures = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  
  const navigation = getNavigation((role || 'guest') as any);
  const currentIndex = navigation.findIndex(item => item.href === location.pathname);

  const swipeToNext = () => {
    if (currentIndex < navigation.length - 1) {
      navigate(navigation[currentIndex + 1].href);
    }
  };

  const swipeToPrevious = () => {
    if (currentIndex > 0) {
      navigate(navigation[currentIndex - 1].href);
    }
  };

  return {
    SwipeNavigation: ({ children }: { children: React.ReactNode }) => (
      <SwipeNavigation 
        onSwipeLeft={swipeToNext}
        onSwipeRight={swipeToPrevious}
      >
        {children}
      </SwipeNavigation>
    ),
    canSwipeNext: currentIndex < navigation.length - 1,
    canSwipePrevious: currentIndex > 0,
    nextPage: currentIndex < navigation.length - 1 ? navigation[currentIndex + 1] : null,
    previousPage: currentIndex > 0 ? navigation[currentIndex - 1] : null,
  };
};