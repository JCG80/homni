import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { UserRole } from '@/modules/auth/normalizeRole';
import { logger } from '@/utils/logger';

export interface NavigationPreferences {
  sidebarCollapsed: boolean;
  favoriteRoutes: string[];
  recentRoutes: string[];
  quickAccessRoutes: string[];
  notificationSettings: {
    showBadges: boolean;
    showSuggestions: boolean;
    showQuickActions: boolean;
  };
  dashboardLayout: {
    [role: string]: {
      widgets: string[];
      collapsed: string[];
    };
  };
}

const DEFAULT_PREFERENCES: NavigationPreferences = {
  sidebarCollapsed: false,
  favoriteRoutes: [],
  recentRoutes: [],
  quickAccessRoutes: [],
  notificationSettings: {
    showBadges: true,
    showSuggestions: true,
    showQuickActions: true,
  },
  dashboardLayout: {},
};

const STORAGE_KEY = 'homni-navigation-preferences';
const MAX_RECENT_ROUTES = 10;

export const useNavigationPreferences = () => {
  const [preferences, setPreferences] = useState<NavigationPreferences>(DEFAULT_PREFERENCES);
  const location = useLocation();

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedPreferences = JSON.parse(stored);
        setPreferences(prev => ({ ...prev, ...parsedPreferences }));
      }
    } catch (error) {
      logger.warn('[NavigationPreferences] Failed to load preferences:', {}, error);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      logger.warn('[NavigationPreferences] Failed to save preferences:', {}, error);
    }
  }, [preferences]);

  // Track route changes
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath && currentPath !== '/') {
      setPreferences(prev => ({
        ...prev,
        recentRoutes: [
          currentPath,
          ...prev.recentRoutes.filter(route => route !== currentPath)
        ].slice(0, MAX_RECENT_ROUTES)
      }));
    }
  }, [location.pathname]);

  const updatePreferences = useCallback((updates: Partial<NavigationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      sidebarCollapsed: !prev.sidebarCollapsed
    }));
  }, []);

  const addFavoriteRoute = useCallback((route: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteRoutes: [...new Set([...prev.favoriteRoutes, route])]
    }));
  }, []);

  const removeFavoriteRoute = useCallback((route: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteRoutes: prev.favoriteRoutes.filter(r => r !== route)
    }));
  }, []);

  const addQuickAccessRoute = useCallback((route: string) => {
    setPreferences(prev => ({
      ...prev,
      quickAccessRoutes: [...new Set([...prev.quickAccessRoutes, route])].slice(0, 5)
    }));
  }, []);

  const removeQuickAccessRoute = useCallback((route: string) => {
    setPreferences(prev => ({
      ...prev,
      quickAccessRoutes: prev.quickAccessRoutes.filter(r => r !== route)
    }));
  }, []);

  const updateDashboardLayout = useCallback((role: UserRole, layout: { widgets: string[]; collapsed: string[] }) => {
    setPreferences(prev => ({
      ...prev,
      dashboardLayout: {
        ...prev.dashboardLayout,
        [role]: layout
      }
    }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    preferences,
    updatePreferences,
    toggleSidebar,
    addFavoriteRoute,
    removeFavoriteRoute,
    addQuickAccessRoute,
    removeQuickAccessRoute,
    updateDashboardLayout,
    resetPreferences,
  };
};