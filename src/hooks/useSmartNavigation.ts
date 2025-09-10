import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { useNavigationContext } from './useNavigationContext';
import { useNavigationCache } from './useNavigationCache';
import { getNavigation, getNextSuggestions } from '@/config/navigation';
import { UserRole } from '@/modules/auth/normalizeRole';

interface SmartNavigationHook {
  // Navigation state
  isNavigating: boolean;
  currentRoute: string;
  availableRoutes: any[];
  
  // Smart suggestions
  quickSuggestions: any[];
  contextualSuggestions: any[];
  
  // Performance metrics
  navigationTime: number;
  cacheHitRate: string;
  
  // Actions
  navigateWithPreload: (path: string, moduleId?: string) => Promise<void>;
  preloadSuggestions: () => Promise<void>;
  trackNavigationPerformance: (startTime: number) => void;
  
  // Context
  navigationHistory: string[];
  frequentRoutes: string[];
}

export function useSmartNavigation(): SmartNavigationHook {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { preferences, getRecommendedRoutes } = useNavigationContext();
  const { 
    preloadRoute, 
    getNavigationSuggestions, 
    getAnalytics,
    frequentRoutes,
    lastVisited 
  } = useNavigationCache();

  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationTime, setNavigationTime] = useState(0);

  // Get available routes based on role
  const availableRoutes = useMemo(() => {
    if (!role) return [];
    return getNavigation(role as UserRole);
  }, [role]);

  // Generate smart suggestions
  const quickSuggestions = useMemo(() => {
    const currentPath = location.pathname;
    
    // Combine multiple suggestion sources
    const sources = [
      // Context-based suggestions
      getNextSuggestions(currentPath, role as UserRole),
      // Cache-based suggestions  
      getNavigationSuggestions().map(path => {
        const navItem = availableRoutes.find(item => item.href === path);
        return navItem || { href: path, title: path.split('/').pop() || path };
      }),
      // Role-based recommendations
      getRecommendedRoutes(role as UserRole).map(path => {
        const navItem = availableRoutes.find(item => item.href === path);
        return navItem || { href: path, title: path.split('/').pop() || path };
      }),
    ].flat();

    // Remove duplicates and current route
    const unique = sources.filter((item, index, array) => 
      item.href !== currentPath &&
      array.findIndex(i => i.href === item.href) === index
    );

    return unique.slice(0, 5);
  }, [location.pathname, role, availableRoutes, getNavigationSuggestions, getRecommendedRoutes]);

  // Get contextual suggestions based on current route
  const contextualSuggestions = useMemo(() => {
    const currentPath = location.pathname;
    return getNextSuggestions(currentPath, role as UserRole);
  }, [location.pathname, role]);

  // Enhanced navigation with preloading
  const navigateWithPreload = useCallback(async (path: string, moduleId?: string) => {
    const startTime = performance.now();
    setIsNavigating(true);

    try {
      // Preload the route if module specified
      if (moduleId) {
        await preloadRoute(path, moduleId);
      }

      // Navigate
      navigate(path);

      // Track performance
      const endTime = performance.now();
      const duration = endTime - startTime;
      setNavigationTime(duration);
      
      // Analytics
      console.log(`Navigation to ${path} took ${duration.toFixed(2)}ms`);
      
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setIsNavigating(false);
    }
  }, [navigate, preloadRoute]);

  // Preload suggested routes for faster navigation
  const preloadSuggestions = useCallback(async () => {
    const routesToPreload = quickSuggestions.slice(0, 3); // Preload top 3 suggestions
    
    const preloadPromises = routesToPreload.map(async (suggestion) => {
      try {
        // Determine module ID based on route
        const moduleId = getModuleIdFromRoute(suggestion.href);
        if (moduleId) {
          await preloadRoute(suggestion.href, moduleId);
        }
      } catch (error) {
        console.warn(`Failed to preload ${suggestion.href}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }, [quickSuggestions, preloadRoute]);

  // Track navigation performance
  const trackNavigationPerformance = useCallback((startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    setNavigationTime(duration);

    // Log performance metrics
    if (duration > 1000) {
      console.warn(`Slow navigation detected: ${duration.toFixed(2)}ms`);
    }
  }, []);

  // Auto-preload suggestions when they change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      preloadSuggestions();
    }, 500); // Small delay to avoid excessive preloading

    return () => clearTimeout(timeoutId);
  }, [preloadSuggestions]);

  // Get analytics data
  const analytics = getAnalytics();

  return {
    // State
    isNavigating,
    currentRoute: location.pathname,
    availableRoutes,
    
    // Suggestions
    quickSuggestions,
    contextualSuggestions,
    
    // Performance
    navigationTime,
    cacheHitRate: analytics.cacheHitRate,
    
    // Actions
    navigateWithPreload,
    preloadSuggestions,
    trackNavigationPerformance,
    
    // Context
    navigationHistory: lastVisited,
    frequentRoutes,
  };
}

// Helper function to determine module ID from route
function getModuleIdFromRoute(route: string): string | undefined {
  const routeModuleMap: Record<string, string> = {
    '/leads': 'lead-engine',
    '/property': 'property-management', 
    '/sales': 'diy-selling',
    '/admin': 'admin-dashboard',
    '/admin/leads/distribution': 'lead-distribution',
  };

  // Check exact matches first
  if (routeModuleMap[route]) {
    return routeModuleMap[route];
  }

  // Check prefix matches
  for (const [prefix, moduleId] of Object.entries(routeModuleMap)) {
    if (route.startsWith(prefix)) {
      return moduleId;
    }
  }

  return undefined;
}