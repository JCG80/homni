/**
 * Cross-Platform Navigation Component
 * Unified navigation that adapts to any device and context
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdaptiveNavigation } from '@/hooks/navigation/useAdaptiveNavigation';
import { useModuleNavigation } from '@/hooks/useModuleNavigation';
import { NavigationRenderer } from './NavigationRenderer';
import { SmartBreadcrumbs } from './SmartBreadcrumbs';
import { QuickActionsDropdown } from './QuickActionsDropdown';
import { 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  Home,
  Grid3X3,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CrossPlatformNavigationProps {
  children?: React.ReactNode;
  className?: string;
  items?: any[];
  variant?: string;
  density?: 'compact' | 'comfortable' | 'spacious';
  enableAnimations?: boolean;
}

export const CrossPlatformNavigation: React.FC<CrossPlatformNavigationProps> = ({
  children,
  className,
  items = [],
  variant = 'horizontal',
  density = 'comfortable',
  enableAnimations = true
}) => {
  const location = useLocation();
  const {
    deviceContext,
    navigationContext,
    adaptiveConfig,
    quickActions,
    navigateWithTracking,
    handleSwipeBack,
    handleSwipeForward,
    shouldShowAnimation,
    getLayoutClasses
  } = useAdaptiveNavigation();

  const { navigation, isLoading } = useModuleNavigation();
  const layoutClasses = getLayoutClasses();

  // Mobile tab navigation
  const [activeTab, setActiveTab] = useState('primary');

  // Gesture handling for mobile
  useEffect(() => {
    if (!adaptiveConfig.enableGestures) return;

    let startX: number;
    let startY: number;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX || !startY) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      // Horizontal swipe detection
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0 && navigationContext.hasBack) {
          handleSwipeBack();
        } else if (deltaX < 0 && navigationContext.canNavigateForward) {
          handleSwipeForward();
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [adaptiveConfig.enableGestures, navigationContext, handleSwipeBack, handleSwipeForward]);

  // Desktop/Tablet Sidebar Layout
  if (adaptiveConfig.showSidebar) {
    return (
      <div className={cn("min-h-screen flex w-full", className)}>
        <AppSidebar 
          navigation={navigation}
          isLoading={isLoading}
          collapsed={adaptiveConfig.sidebarCollapsed}
          density={adaptiveConfig.navigationDensity}
        />
        
        <main className="flex-1 overflow-hidden">
          {adaptiveConfig.showBreadcrumbs && (
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto px-4 py-2">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {/* Toggle sidebar */}}
                    className="md:hidden"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                  <SmartBreadcrumbs />
                  <div className="ml-auto">
                    <QuickActionsDropdown variant="icon" />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Mobile/Tablet Tab Layout
  if (adaptiveConfig.showTabBar) {
    return (
      <div className={cn("min-h-screen flex flex-col", className)}>
        {/* Top navigation bar */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-2">
            {navigationContext.hasBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSwipeBack}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            
            {adaptiveConfig.showBreadcrumbs && (
              <SmartBreadcrumbs 
                showHomeButton={!navigationContext.hasBack}
                showBackButton={false}
                maxItems={2}
              />
            )}
          </div>
          
          <QuickActionsDropdown variant="icon" />
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {/* Bottom tab navigation */}
        <MobileTabNavigation
          navigation={navigation}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          quickActions={quickActions}
          density={adaptiveConfig.navigationDensity}
        />
      </div>
    );
  }

  // Fallback layout (minimal)
  return (
    <div className={cn("min-h-screen", className)}>
          {children || (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-muted-foreground">Navigasjon lastes...</p>
            </div>
          )}
    </div>
  );
};

// Adaptive Sidebar Component
interface AppSidebarProps {
  navigation: any;
  isLoading: boolean;
  collapsed: boolean;
  density: 'compact' | 'comfortable' | 'spacious';
}

const AppSidebar: React.FC<AppSidebarProps> = ({
  navigation,
  isLoading,
  collapsed,
  density
}) => {
  const isCollapsed = collapsed;

  return (
    <aside className={cn(
      "bg-background border-r transition-all duration-200 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="px-2 py-4 flex-1">
        <div className="space-y-2">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={i}
                className="h-10 bg-muted animate-pulse rounded-md"
              />
            ))
          ) : (
            <NavigationRenderer
              items={navigation.primary}
              variant="vertical"
              showIcons={true}
              showDescriptions={!isCollapsed}
              className={cn(
                density === 'compact' && "space-y-1",
                density === 'spacious' && "space-y-3"
              )}
            />
          )}
        </div>

        {/* Quick actions in sidebar footer */}
        {!isCollapsed && navigation.quickActions?.length > 0 && (
          <div className="mt-8 pt-4 border-t">
            <h4 className="text-sm font-medium text-muted-foreground mb-2 px-2">
              Hurtighandlinger
            </h4>
            <NavigationRenderer
              items={navigation.quickActions.slice(0, 3)}
              variant="vertical"
              showIcons={true}
              showDescriptions={true}
              className="space-y-1"
            />
          </div>
        )}
      </div>
    </aside>
  );
};

// Mobile Tab Navigation Component
interface MobileTabNavigationProps {
  navigation: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
  quickActions: any[];
  density: 'compact' | 'comfortable' | 'spacious';
}

const MobileTabNavigation: React.FC<MobileTabNavigationProps> = ({
  navigation,
  activeTab,
  onTabChange,
  quickActions,
  density
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get primary navigation items for tabs
  const primaryTabs = navigation.primary?.slice(0, 4) || [];
  const hasMore = navigation.primary?.length > 4;

  return (
    <div className="border-t bg-background">
      <div className="flex items-center">
        {primaryTabs.map((item: any) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.href);
          
          return (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 p-3 transition-colors",
                density === 'compact' && "p-2",
                isActive 
                  ? "text-primary bg-primary/5" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                {Icon && <Icon className="h-5 w-5" />}
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium truncate max-w-full">
                {item.title}
              </span>
            </button>
          );
        })}
        
        {hasMore && (
          <button
            onClick={() => onTabChange('more')}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 p-3 transition-colors",
              density === 'compact' && "p-2",
              activeTab === 'more' 
                ? "text-primary bg-primary/5" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-xs font-medium">Mer</span>
          </button>
        )}
      </div>
    </div>
  );
};