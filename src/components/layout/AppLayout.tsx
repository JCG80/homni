import React, { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { QuickAccessFAB } from '@/components/mobile/QuickAccessFAB';
import { MobileBottomNavigation, MobileNavigationGestures } from '@/components/mobile/MobileNavigation';
import { ContextualNavigationPanel } from '@/components/navigation/ContextualNavigationPanel';
import { useAuth } from '@/modules/auth/hooks';
import { useLazyModules } from '@/hooks/useLazyModules';
import { PWAInstallBanner } from '@/components/pwa/PWAInstallBanner';
import { ServiceWorkerUpdateBanner, OfflineIndicator } from '@/components/pwa/ServiceWorkerComponents';

const PageLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="text-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-muted-foreground">Laster inn...</p>
    </div>
  </div>
);

export const AppLayout = () => {
  const { role, isAuthenticated } = useAuth();
  const { preloadModules } = useLazyModules(role || null);
  const { SwipeNavigation } = MobileNavigationGestures();

  // Preload modules when user role is available
  useEffect(() => {
    if (isAuthenticated && role) {
      preloadModules();
    }
  }, [isAuthenticated, role, preloadModules]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        {/* Main Content Area */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] pb-16 md:pb-0">
          <SwipeNavigation>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Suspense fallback={<PageLoadingFallback />}>
                <Outlet />
              </Suspense>
            </motion.div>
          </SwipeNavigation>

          {/* Contextual Navigation - Desktop Only */}
          <div className="hidden xl:block fixed right-4 top-20 w-80">
            <ContextualNavigationPanel variant="sidebar" />
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <QuickAccessFAB />
      <MobileBottomNavigation />
      
      {/* PWA Components */}
      <PWAInstallBanner />
      <ServiceWorkerUpdateBanner />
      <OfflineIndicator />
    </div>
  );
};