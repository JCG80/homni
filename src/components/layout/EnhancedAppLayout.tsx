import React, { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { QuickAccessFAB } from '@/components/mobile/QuickAccessFAB';
import { MobileBottomNavigation, MobileNavigationGestures } from '@/components/mobile/MobileNavigation';
import { MobileNavigationEnhancements } from '@/components/mobile/MobileNavigationEnhancements';
import { ContextualNavigationPanel } from '@/components/navigation/ContextualNavigationPanel';
import { EnhancedBreadcrumb } from '@/components/navigation';
import { SmartNavigationSuggestions } from '@/components/navigation/SmartNavigationSuggestions';
import { NavigationLoadingStates, RouteTransition } from '@/components/navigation/NavigationLoadingStates';
import { useAuth } from '@/modules/auth/hooks';
import { useLazyModules } from '@/hooks/useLazyModules';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface EnhancedAppLayoutProps {
  children?: React.ReactNode;
  showBreadcrumbs?: boolean;
  showSuggestions?: boolean;
  className?: string;
}

export const EnhancedAppLayout: React.FC<EnhancedAppLayoutProps> = ({
  children,
  showBreadcrumbs = true,
  showSuggestions = true,
  className,
}) => {
  const { role, isAuthenticated } = useAuth();
  const { preloadModules } = useLazyModules(role || null);
  const { isNavigating, preloadSuggestions } = useSmartNavigation();
  const { SwipeNavigation } = MobileNavigationGestures();
  const isMobile = useIsMobile();

  // Preload modules when user role is available
  useEffect(() => {
    if (role) {
      preloadModules();
      preloadSuggestions();
    }
  }, [role, preloadModules, preloadSuggestions]);

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <Header />
      
      {/* Breadcrumbs - Desktop only */}
      {showBreadcrumbs && !isMobile && isAuthenticated && (
        <div className="container mx-auto px-4 py-2 border-b border-border/50">
          <EnhancedBreadcrumb />
        </div>
      )}

      <div className="flex">
        {/* Contextual Navigation Panel - Desktop sidebar */}
        {!isMobile && isAuthenticated && (
          <aside className="w-64 border-r border-border/50 bg-muted/20">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
              <ContextualNavigationPanel className="p-4" />
              
              {/* Smart Suggestions */}
              {showSuggestions && (
                <div className="p-4 pt-0">
                  <SmartNavigationSuggestions 
                    maxSuggestions={3}
                    showPerformanceMetrics={false}
                  />
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <SwipeNavigation>
            <RouteTransition isTransitioning={isNavigating}>
              <div className="container mx-auto px-4 py-6">
                <Suspense fallback={
                  <NavigationLoadingStates 
                    state="loading" 
                    message="Laster innhold..."
                  />
                }>
                  {children || <Outlet />}
                </Suspense>
              </div>
            </RouteTransition>
          </SwipeNavigation>
        </main>
      </div>

      {/* Mobile Navigation */}
      {isMobile && isAuthenticated && (
        <>
          <MobileBottomNavigation />
          <QuickAccessFAB />
          <MobileNavigationEnhancements />
        </>
      )}

      {/* Desktop Quick Access FAB */}
      {!isMobile && isAuthenticated && <QuickAccessFAB />}
    </div>
  );
};

export default EnhancedAppLayout;