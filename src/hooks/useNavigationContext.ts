import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { UserRole } from '@/modules/auth/normalizeRole';

interface NavigationPreferences {
  lastVisitedSection?: string;
  preferredAdminSection?: string;
  navigationHistory: string[];
  quickAccessRoutes: string[];
}

interface NavigationContext {
  preferences: NavigationPreferences;
  updateLastVisited: (route: string) => void;
  addToQuickAccess: (route: string) => void;
  removeFromQuickAccess: (route: string) => void;
  getRecommendedRoutes: (role: UserRole) => string[];
  isFrequentRoute: (route: string) => boolean;
}

const STORAGE_KEY = 'homni_navigation_context';
const MAX_HISTORY = 20;
const MAX_QUICK_ACCESS = 5;

export function useNavigationContext(): NavigationContext {
  const location = useLocation();
  const [preferences, setPreferences] = useState<NavigationPreferences>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      navigationHistory: [],
      quickAccessRoutes: [],
    };
  });

  // Persist preferences to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  // Track current route visits
  useEffect(() => {
    try {
      const currentPath = location.pathname;
      if (currentPath !== '/') {
        updateLastVisited(currentPath);
      }
    } catch (error) {
      // Silently handle Router context errors
      console.warn('Router context not available in useNavigationContext');
    }
  }, [location?.pathname]);

  const updateLastVisited = useCallback((route: string) => {
    setPreferences(prev => {
      const newHistory = [route, ...prev.navigationHistory.filter(r => r !== route)]
        .slice(0, MAX_HISTORY);
      
      const isAdminRoute = route.startsWith('/admin');
      
      return {
        ...prev,
        lastVisitedSection: route,
        preferredAdminSection: isAdminRoute ? route : prev.preferredAdminSection,
        navigationHistory: newHistory,
      };
    });
  }, []);

  const addToQuickAccess = useCallback((route: string) => {
    setPreferences(prev => {
      if (prev.quickAccessRoutes.includes(route)) return prev;
      
      const newQuickAccess = [route, ...prev.quickAccessRoutes]
        .slice(0, MAX_QUICK_ACCESS);
      
      return {
        ...prev,
        quickAccessRoutes: newQuickAccess,
      };
    });
  }, []);

  const removeFromQuickAccess = useCallback((route: string) => {
    setPreferences(prev => ({
      ...prev,
      quickAccessRoutes: prev.quickAccessRoutes.filter(r => r !== route),
    }));
  }, []);

  const getRecommendedRoutes = useCallback((role: UserRole): string[] => {
    // Get most visited routes for this role
    const frequentRoutes = preferences.navigationHistory
      .slice(0, 10)
      .filter(route => {
        // Basic role-based filtering
        if (role === 'guest') return !route.startsWith('/admin') && !route.startsWith('/dashboard');
        if (['admin', 'master_admin'].includes(role)) return true;
        return !route.startsWith('/admin');
      });

    return [...new Set(frequentRoutes)].slice(0, 5);
  }, [preferences.navigationHistory]);

  const isFrequentRoute = useCallback((route: string): boolean => {
    const visits = preferences.navigationHistory.filter(r => r === route).length;
    return visits >= 3;
  }, [preferences.navigationHistory]);

  return {
    preferences,
    updateLastVisited,
    addToQuickAccess,
    removeFromQuickAccess,
    getRecommendedRoutes,
    isFrequentRoute,
  };
}