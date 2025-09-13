/**
 * Navigation Optimizer - Central navigation enhancement component
 * Coordinates all navigation features for optimal user experience
 */

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { NavigationSync } from './NavigationSync';
import { UserEngagementTracker } from './UserEngagementTracker';
import { NavigationEngagement } from './NavigationEngagement';
import { CommandPalette } from './CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/navigation/useKeyboardShortcuts';
import { useAdaptiveNavigation } from '@/hooks/navigation/useAdaptiveNavigation';
import { useAuth } from '@/modules/auth/hooks';
import { useIsMobile } from '@/hooks/use-mobile';
import { logger } from '@/utils/logger';

interface NavigationOptimizerProps {
  children: React.ReactNode;
  enableSync?: boolean;
  enableEngagement?: boolean;
  enableCommandPalette?: boolean;
  enableUserTracking?: boolean;
}

export const NavigationOptimizer: React.FC<NavigationOptimizerProps> = ({
  children,
  enableSync = true,
  enableEngagement = true,
  enableCommandPalette = true,
  enableUserTracking = true
}) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const { isCommandPaletteOpen, setIsCommandPaletteOpen } = useKeyboardShortcuts();
  const { 
    deviceContext, 
    adaptiveConfig, 
    shouldShowAnimation,
    navigationTiming,
    navigateWithTracking
  } = useAdaptiveNavigation();

  const [optimizationMetrics, setOptimizationMetrics] = useState({
    syncEnabled: false,
    engagementActive: false,
    commandPaletteReady: false,
    trackingInitialized: false,
    performanceOptimized: false
  });

  // Initialize navigation optimization
  useEffect(() => {
    const initializeOptimization = async () => {
      try {
        // Log initialization
        logger.info('Navigation optimization initializing', {
          isAuthenticated,
          isMobile,
          deviceContext,
          adaptiveConfig
        });

        // Set up performance optimization
        const optimizePerformance = () => {
          // Preload critical routes based on user behavior
          if (isAuthenticated && !isMobile) {
            // Desktop users get more aggressive preloading
            const criticalRoutes = ['/dashboard', '/leads', '/properties'];
            criticalRoutes.forEach(route => {
              if (location.pathname !== route) {
                // Preload route modules
                import(`@/pages${route}/index.tsx`).catch(() => {
                  // Route might not exist, ignore
                });
              }
            });
          }

          setOptimizationMetrics(prev => ({
            ...prev,
            performanceOptimized: true
          }));
        };

        // Initialize sync if enabled
        if (enableSync) {
          setOptimizationMetrics(prev => ({
            ...prev,
            syncEnabled: true
          }));
        }

        // Initialize engagement tracking if enabled
        if (enableEngagement && isAuthenticated) {
          setOptimizationMetrics(prev => ({
            ...prev,
            engagementActive: true
          }));
        }

        // Initialize command palette if enabled
        if (enableCommandPalette) {
          setOptimizationMetrics(prev => ({
            ...prev,
            commandPaletteReady: true
          }));
        }

        // Initialize user tracking if enabled
        if (enableUserTracking && isAuthenticated) {
          setOptimizationMetrics(prev => ({
            ...prev,
            trackingInitialized: true
          }));
        }

        // Performance optimization
        setTimeout(optimizePerformance, 1000);

        logger.info('Navigation optimization initialized successfully', {
          metrics: optimizationMetrics,
          features: {
            sync: enableSync,
            engagement: enableEngagement,
            commandPalette: enableCommandPalette,
            userTracking: enableUserTracking
          }
        });

      } catch (error) {
        logger.error('Navigation optimization initialization failed', {
          error,
          location: location.pathname
        });
      }
    };

    initializeOptimization();
  }, [
    isAuthenticated, 
    isMobile, 
    location.pathname,
    enableSync,
    enableEngagement,
    enableCommandPalette,
    enableUserTracking
  ]);

  // Monitor navigation performance
  useEffect(() => {
    if (navigationTiming && navigationTiming.duration > 0) {
      logger.debug('Navigation performance tracked', {
        path: location.pathname,
        duration: navigationTiming.duration,
        deviceType: deviceContext.isMobile ? 'mobile' : 'desktop',
        isOptimal: navigationTiming.duration < 200
      });
    }
  }, [navigationTiming, location.pathname, deviceContext]);

  // Route change optimization
  useEffect(() => {
    const startTime = performance.now();
    const currentPath = location.pathname;

    // Track route change timing
    const endTime = performance.now();
    const routeChangeTime = endTime - startTime;

    logger.debug('Route change optimized', {
      path: currentPath,
      timing: routeChangeTime,
      adaptiveConfig,
      shouldShowAnimation
    });
  }, [location.pathname]);

  return (
    <>
      {children}
      
      {/* Navigation Sync - Cross-device synchronization */}
      {enableSync && optimizationMetrics.syncEnabled && <NavigationSync />}
      
      {/* User Engagement Tracker - Analytics and behavior tracking */}
      {enableUserTracking && optimizationMetrics.trackingInitialized && isAuthenticated && (
        <UserEngagementTracker />
      )}
      
      {/* Command Palette - Quick navigation */}
      {enableCommandPalette && optimizationMetrics.commandPaletteReady && (
        <CommandPalette
          open={isCommandPaletteOpen}
          onOpenChange={setIsCommandPaletteOpen}
        />
      )}
      
      {/* Navigation Engagement Panel - Only for authenticated users on desktop */}
      {enableEngagement && 
       optimizationMetrics.engagementActive && 
       isAuthenticated && 
       !isMobile && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm">
          <NavigationEngagement className="shadow-lg" />
        </div>
      )}
      
      {/* Development metrics (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 right-4 z-50 bg-black/80 text-white p-2 rounded text-xs font-mono max-w-xs">
          <div className="font-bold mb-1">Navigation Optimizer</div>
          <div>Sync: {optimizationMetrics.syncEnabled ? '✓' : '✗'}</div>
          <div>Engagement: {optimizationMetrics.engagementActive ? '✓' : '✗'}</div>
          <div>Command: {optimizationMetrics.commandPaletteReady ? '✓' : '✗'}</div>
          <div>Tracking: {optimizationMetrics.trackingInitialized ? '✓' : '✗'}</div>
          <div>Performance: {optimizationMetrics.performanceOptimized ? '✓' : '✗'}</div>
          {navigationTiming && (
            <div className="mt-1 pt-1 border-t border-gray-600">
              Last nav: {navigationTiming.duration?.toFixed(0)}ms
            </div>
          )}
        </div>
      )}
    </>
  );
};