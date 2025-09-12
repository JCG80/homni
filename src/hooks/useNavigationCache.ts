import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logger } from '@/utils/logger';

interface CachedRoute {
  path: string;
  timestamp: number;
  preloadData?: any;
  moduleId?: string;
}

interface NavigationCache {
  routes: Map<string, CachedRoute>;
  frequentRoutes: string[];
  lastVisited: string[];
}

const CACHE_KEY = 'homni_navigation_cache';
const MAX_CACHE_SIZE = 20;
const MAX_FREQUENT_ROUTES = 5;
const CACHE_EXPIRY = 1000 * 60 * 30; // 30 minutes

export function useNavigationCache() {
  const location = useLocation();
  const [cache, setCache] = useState<NavigationCache>(() => {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          routes: new Map(parsed.routes || []),
          frequentRoutes: parsed.frequentRoutes || [],
          lastVisited: parsed.lastVisited || [],
        };
      }
    } catch (error) {
      logger.warn('Failed to load navigation cache:', {}, error);
    }
    
    return {
      routes: new Map(),
      frequentRoutes: [],
      lastVisited: [],
    };
  });

  // Persist cache to localStorage
  useEffect(() => {
    try {
      const cacheData = {
        routes: Array.from(cache.routes.entries()),
        frequentRoutes: cache.frequentRoutes,
        lastVisited: cache.lastVisited,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      logger.warn('Failed to persist navigation cache:', {}, error);
    }
  }, [cache]);

  // Track current route visit
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath !== '/') {
      trackRouteVisit(currentPath);
    }
  }, [location.pathname]);

  const trackRouteVisit = useCallback((path: string) => {
    setCache(prev => {
      const now = Date.now();
      const newRoutes = new Map(prev.routes);
      
      // Update or add route
      newRoutes.set(path, {
        path,
        timestamp: now,
        ...(newRoutes.get(path) || {}),
      });

      // Clean up expired entries
      for (const [routePath, route] of newRoutes.entries()) {
        if (now - route.timestamp > CACHE_EXPIRY) {
          newRoutes.delete(routePath);
        }
      }

      // Limit cache size
      if (newRoutes.size > MAX_CACHE_SIZE) {
        const sortedEntries = Array.from(newRoutes.entries())
          .sort(([, a], [, b]) => b.timestamp - a.timestamp)
          .slice(0, MAX_CACHE_SIZE);
        newRoutes.clear();
        sortedEntries.forEach(([key, value]) => newRoutes.set(key, value));
      }

      // Update last visited
      const newLastVisited = [path, ...prev.lastVisited.filter(p => p !== path)]
        .slice(0, 10);

      // Update frequent routes
      const routeCounts = new Map<string, number>();
      newLastVisited.forEach(route => {
        routeCounts.set(route, (routeCounts.get(route) || 0) + 1);
      });

      const newFrequentRoutes = Array.from(routeCounts.entries())
        .filter(([, count]) => count >= 3)
        .sort(([, a], [, b]) => b - a)
        .slice(0, MAX_FREQUENT_ROUTES)
        .map(([route]) => route);

      return {
        routes: newRoutes,
        frequentRoutes: newFrequentRoutes,
        lastVisited: newLastVisited,
      };
    });
  }, []);

  const cacheRouteData = useCallback((path: string, data: any, moduleId?: string) => {
    setCache(prev => {
      const newRoutes = new Map(prev.routes);
      const existing = newRoutes.get(path);
      
      newRoutes.set(path, {
        ...existing,
        path,
        timestamp: existing?.timestamp || Date.now(),
        preloadData: data,
        moduleId,
      });

      return {
        ...prev,
        routes: newRoutes,
      };
    });
  }, []);

  const getCachedData = useCallback((path: string): any => {
    const cached = cache.routes.get(path);
    
    if (!cached) return null;
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp > CACHE_EXPIRY) {
      return null;
    }
    
    return cached.preloadData;
  }, [cache.routes]);

  const preloadRoute = useCallback(async (path: string, moduleId?: string) => {
    // Don't preload if already cached
    if (cache.routes.has(path)) {
      const cached = cache.routes.get(path);
      if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
        return cached.preloadData;
      }
    }

    try {
      // Preload module if specified
      if (moduleId) {
        const moduleRegistry = await import('@/hooks/useLazyModules').then(m => m.moduleRegistry);
        const config = moduleRegistry[moduleId];
        
        if (config?.component) {
          // Trigger module loading
          const LazyComponent = config.component as any;
          if (LazyComponent._payload && LazyComponent._payload._fn) {
            await LazyComponent._payload._fn();
          }
        }
      }

      // Cache the preload
      cacheRouteData(path, { preloaded: true }, moduleId);
      
      return true;
    } catch (error) {
      logger.warn(`Failed to preload route ${path}:`, {}, error);
      return false;
    }
  }, [cache.routes, cacheRouteData]);

  const getNavigationSuggestions = useCallback(() => {
    const currentPath = location.pathname;
    
    // Combine frequent routes and recent routes, excluding current
    const suggestions = [
      ...cache.frequentRoutes,
      ...cache.lastVisited.slice(0, 3),
    ]
      .filter(path => path !== currentPath)
      .slice(0, 5);

    return [...new Set(suggestions)]; // Remove duplicates
  }, [cache.frequentRoutes, cache.lastVisited, location.pathname]);

  const clearCache = useCallback(() => {
    setCache({
      routes: new Map(),
      frequentRoutes: [],
      lastVisited: [],
    });
    localStorage.removeItem(CACHE_KEY);
  }, []);

  const getAnalytics = useCallback(() => {
    const now = Date.now();
    const routeVisits = Array.from(cache.routes.values())
      .filter(route => now - route.timestamp < CACHE_EXPIRY);

    return {
      totalRoutes: routeVisits.length,
      frequentRoutes: cache.frequentRoutes.length,
      cacheHitRate: cache.routes.size > 0 ? 
        (routeVisits.length / cache.routes.size * 100).toFixed(1) : '0',
      lastVisitedCount: cache.lastVisited.length,
      averageSessionLength: routeVisits.length,
    };
  }, [cache]);

  return {
    cache: cache.routes,
    frequentRoutes: cache.frequentRoutes,
    lastVisited: cache.lastVisited,
    trackRouteVisit,
    cacheRouteData,
    getCachedData,
    preloadRoute,
    getNavigationSuggestions,
    clearCache,
    getAnalytics,
  };
}