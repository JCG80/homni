/**
 * Adaptive Navigation Hook - Cross-platform navigation optimization
 * Automatically adapts navigation based on device, context, and user behavior
 */

import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigationPreferences } from './useNavigationPreferences';
import { useQuickActions } from './useQuickActions';
import type { NavigationItem } from '@/types/consolidated-types';

interface DeviceContext {
  isMobile: boolean;
  isTablet: boolean;
  isTouchDevice: boolean;
  screenSize: 'sm' | 'md' | 'lg' | 'xl';
  orientation: 'portrait' | 'landscape';
}

interface NavigationContext {
  currentPath: string;
  depth: number;
  category: 'dashboard' | 'admin' | 'content' | 'settings' | 'other';
  hasBack: boolean;
  canNavigateForward: boolean;
}

interface AdaptiveNavigationConfig {
  showBreadcrumbs: boolean;
  showSidebar: boolean;
  sidebarCollapsed: boolean;
  showTabBar: boolean;
  enableGestures: boolean;
  quickActionsCount: number;
  navigationDensity: 'compact' | 'comfortable' | 'spacious';
}

export function useAdaptiveNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const { preferences, updatePreferences } = useNavigationPreferences();
  const { quickActions } = useQuickActions();

  // Device context detection
  const deviceContext = useMemo((): DeviceContext => {
    const width = window.innerWidth;
    const isTouchDevice = 'ontouchstart' in window;
    
    return {
      isMobile,
      isTablet: width >= 768 && width < 1024 && isTouchDevice,
      isTouchDevice,
      screenSize: width < 640 ? 'sm' : width < 1024 ? 'md' : width < 1280 ? 'lg' : 'xl',
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    };
  }, [isMobile]);

  // Navigation context analysis
  const navigationContext = useMemo((): NavigationContext => {
    const segments = location.pathname.split('/').filter(Boolean);
    const depth = segments.length;
    
    let category: NavigationContext['category'] = 'other';
    if (location.pathname.includes('/dashboard')) category = 'dashboard';
    else if (location.pathname.includes('/admin')) category = 'admin';
    else if (location.pathname.includes('/content')) category = 'content';
    else if (location.pathname.includes('/settings') || location.pathname.includes('/account')) category = 'settings';

    return {
      currentPath: location.pathname,
      depth,
      category,
      hasBack: depth > 1,
      canNavigateForward: false // Could be enhanced with browser history API
    };
  }, [location.pathname]);

  // Adaptive configuration based on context and device
  const adaptiveConfig = useMemo((): AdaptiveNavigationConfig => {
    const config: AdaptiveNavigationConfig = {
      showBreadcrumbs: true,
      showSidebar: true,
      sidebarCollapsed: false,
      showTabBar: false,
      enableGestures: false,
      quickActionsCount: 3,
      navigationDensity: 'comfortable'
    };

    // Mobile optimizations
    if (deviceContext.isMobile) {
      config.showSidebar = false;
      config.showTabBar = true;
      config.enableGestures = true;
      config.navigationDensity = 'compact';
      config.quickActionsCount = 2;
      
      // Hide breadcrumbs on small screens for deep paths
      if (navigationContext.depth > 3 && deviceContext.screenSize === 'sm') {
        config.showBreadcrumbs = false;
      }
    }

    // Tablet optimizations
    if (deviceContext.isTablet) {
      config.sidebarCollapsed = true;
      config.enableGestures = true;
      config.quickActionsCount = 4;
      
      if (deviceContext.orientation === 'portrait') {
        config.showTabBar = true;
        config.showSidebar = false;
      }
    }

    // Admin interfaces get more space-efficient layouts
    if (navigationContext.category === 'admin') {
      config.navigationDensity = 'compact';
      config.sidebarCollapsed = deviceContext.screenSize !== 'xl';
    }

    // Dashboard prioritizes content space
    if (navigationContext.category === 'dashboard') {
      config.sidebarCollapsed = deviceContext.screenSize === 'md';
    }

    // Apply user preferences override
    if (preferences.sidebarCollapsed !== undefined) {
      config.sidebarCollapsed = preferences.sidebarCollapsed;
    }

    return config;
  }, [deviceContext, navigationContext, preferences]);

  // Navigation performance tracking
  const [navigationTiming, setNavigationTiming] = useState<Record<string, number>>({});

  const trackNavigation = (path: string, startTime: number) => {
    const duration = performance.now() - startTime;
    setNavigationTiming(prev => ({
      ...prev,
      [path]: duration
    }));

    // Log slow navigations
    if (duration > 500) {
      console.warn('Slow navigation detected:', { path, duration });
    }
  };

  // Enhanced navigate function with performance tracking
  const navigateWithTracking = (path: string, options?: { replace?: boolean }) => {
    const startTime = performance.now();
    
    navigate(path, options);
    
    // Track after navigation (using requestAnimationFrame to ensure DOM is updated)
    requestAnimationFrame(() => {
      trackNavigation(path, startTime);
    });
  };

  // Gesture navigation handlers
  const handleSwipeBack = () => {
    if (navigationContext.hasBack) {
      window.history.back();
    }
  };

  const handleSwipeForward = () => {
    if (navigationContext.canNavigateForward) {
      window.history.forward();
    }
  };

  // Auto-save preferences when config changes
  useEffect(() => {
    if (adaptiveConfig.sidebarCollapsed !== preferences.sidebarCollapsed) {
      updatePreferences({
        sidebarCollapsed: adaptiveConfig.sidebarCollapsed
      });
    }
  }, [adaptiveConfig.sidebarCollapsed, preferences.sidebarCollapsed, updatePreferences]);

  // Optimize for accessibility
  const a11yEnhancements = useMemo(() => ({
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    highContrast: window.matchMedia('(prefers-contrast: high)').matches,
    largeText: window.matchMedia('(min-resolution: 2dppx)').matches
  }), []);

  return {
    // Context information
    deviceContext,
    navigationContext,
    adaptiveConfig,
    a11yEnhancements,

    // Navigation data
    quickActions: quickActions.slice(0, adaptiveConfig.quickActionsCount),
    
    // Navigation functions
    navigateWithTracking,
    handleSwipeBack,
    handleSwipeForward,
    
    // Performance data
    navigationTiming,
    averageNavigationTime: Object.values(navigationTiming).reduce((a, b) => a + b, 0) / Object.values(navigationTiming).length || 0,
    
    // Utility functions
    isOptimalLayout: deviceContext.screenSize === 'lg' || deviceContext.screenSize === 'xl',
    shouldShowAnimation: !a11yEnhancements.reducedMotion,
    getLayoutClasses: () => ({
      sidebar: adaptiveConfig.showSidebar,
      tabBar: adaptiveConfig.showTabBar,
      compact: adaptiveConfig.navigationDensity === 'compact',
      gestures: adaptiveConfig.enableGestures
    })
  };
}