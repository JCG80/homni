/**
 * User Engagement Tracker for Navigation (Simplified Version)
 * Tracks user behavior using localStorage for now
 * Future: Will integrate with Supabase when navigation_events table exists
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { useNavigationPreferences } from '@/hooks/navigation/useNavigationPreferences';

interface NavigationEvent {
  user_id?: string;
  session_id: string;
  event_type: 'navigation' | 'click' | 'hover' | 'scroll' | 'time_spent';
  route_from?: string;
  route_to?: string;
  element_type?: string;
  element_id?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface EngagementMetrics {
  totalPageViews: number;
  uniquePages: number;
  averageTimePerPage: number;
  mostVisitedRoutes: Array<{ route: string; count: number }>;
  navigationPatterns: Array<{ from: string; to: string; frequency: number }>;
  quickActionUsage: Array<{ action: string; usage: number }>;
}

export const UserEngagementTracker: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { preferences, updatePreferences } = useNavigationPreferences();

  // Session management
  const sessionId = useMemo(() => {
    let id = sessionStorage.getItem('homni-session-id');
    if (!id) {
      id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('homni-session-id', id);
    }
    return id;
  }, []);

  // Track page time
  const [pageStartTime, setPageStartTime] = React.useState<number>(Date.now());
  const [previousRoute, setPreviousRoute] = React.useState<string>('');

  // Event tracking utility (localStorage only for now)
  const trackEvent = useCallback(async (event: Omit<NavigationEvent, 'session_id' | 'timestamp'>) => {
    try {
      const fullEvent: NavigationEvent = {
        ...event,
        user_id: isAuthenticated ? user?.id : undefined,
        session_id: sessionId,
        timestamp: new Date().toISOString()
      };

      // Store events locally
      const storageKey = isAuthenticated ? `homni-events-${user?.id}` : 'homni-anonymous-events';
      const events = JSON.parse(localStorage.getItem(storageKey) || '[]');
      events.push(fullEvent);
      
      // Keep only last 100 events to manage storage
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(events));

      // Update navigation preferences based on usage patterns
      updateNavigationPreferencesFromUsage(fullEvent);
      
    } catch (error) {
      console.error('Navigation event tracking error:', error);
    }
  }, [isAuthenticated, user, sessionId]);

  // Update preferences based on usage patterns
  const updateNavigationPreferencesFromUsage = useCallback((event: NavigationEvent) => {
    if (event.event_type === 'navigation' && event.route_to) {
      const currentRoutes = preferences.recentRoutes || [];
      const route = event.route_to;
      
      // Add to recent routes
      const updatedRoutes = [route, ...currentRoutes.filter(r => r !== route)].slice(0, 10);
      
      // Track frequently used routes
      const routeUsage: Record<string, number> = {};
      const events = JSON.parse(localStorage.getItem(
        isAuthenticated ? `homni-events-${user?.id}` : 'homni-anonymous-events'
      ) || '[]');
      
      // Count route usage from stored events
      events.forEach((e: NavigationEvent) => {
        if (e.event_type === 'navigation' && e.route_to) {
          routeUsage[e.route_to] = (routeUsage[e.route_to] || 0) + 1;
        }
      });
      
      // Auto-favorite frequently used routes (>5 visits)
      const favoriteRoutes = preferences.favoriteRoutes || [];
      if (routeUsage[route] >= 5 && !favoriteRoutes.includes(route)) {
        favoriteRoutes.push(route);
      }

      updatePreferences({
        recentRoutes: updatedRoutes,
        favoriteRoutes: favoriteRoutes
      });
    }
  }, [preferences, updatePreferences, isAuthenticated, user]);

  // Track navigation events
  useEffect(() => {
    const currentRoute = location.pathname;
    
    if (previousRoute && previousRoute !== currentRoute) {
      // Track time spent on previous page
      const timeSpent = Date.now() - pageStartTime;
      
      trackEvent({
        event_type: 'time_spent',
        route_from: previousRoute,
        metadata: { duration_ms: timeSpent }
      });

      // Track navigation
      trackEvent({
        event_type: 'navigation',
        route_from: previousRoute,
        route_to: currentRoute
      });
    }

    // Track page view
    trackEvent({
      event_type: 'navigation',
      route_to: currentRoute
    });

    setPreviousRoute(currentRoute);
    setPageStartTime(Date.now());
  }, [location.pathname, trackEvent, pageStartTime, previousRoute]);

  // Track click events
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element;
      const href = target.closest('a')?.getAttribute('href');
      const buttonText = target.closest('button')?.textContent;
      
      if (href || buttonText) {
        trackEvent({
          event_type: 'click',
          route_from: location.pathname,
          element_type: href ? 'link' : 'button',
          element_id: href || buttonText || 'unknown',
          metadata: {
            href,
            text: buttonText,
            className: target.className
          }
        });
      }
    };

    // Track scroll behavior
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercentage = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        
        trackEvent({
          event_type: 'scroll',
          route_from: location.pathname,
          metadata: { scroll_percentage: scrollPercentage }
        });
      }, 1000);
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [location.pathname, trackEvent]);

  // Beforeunload tracking
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - pageStartTime;
      
      try {
        const event: NavigationEvent = {
          user_id: isAuthenticated ? user?.id : undefined,
          session_id: sessionId,
          event_type: 'time_spent',
          route_from: location.pathname,
          timestamp: new Date().toISOString(),
          metadata: { duration_ms: timeSpent, session_end: true }
        };
        
        // Store final event
        const storageKey = isAuthenticated ? `homni-events-${user?.id}` : 'homni-anonymous-events';
        const events = JSON.parse(localStorage.getItem(storageKey) || '[]');
        events.push(event);
        localStorage.setItem(storageKey, JSON.stringify(events));
      } catch (error) {
        console.error('Beforeunload tracking error:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pageStartTime, location.pathname, isAuthenticated, user, sessionId]);

  return children ? <>{children}</> : null;
};

// Hook to access engagement metrics
export const useEngagementMetrics = (): EngagementMetrics & { isLoading: boolean } => {
  const { user, isAuthenticated } = useAuth();
  const [metrics, setMetrics] = React.useState<EngagementMetrics>({
    totalPageViews: 0,
    uniquePages: 0,
    averageTimePerPage: 0,
    mostVisitedRoutes: [],
    navigationPatterns: [],
    quickActionUsage: []
  });
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        // Load from localStorage
        const storageKey = isAuthenticated ? `homni-events-${user?.id}` : 'homni-anonymous-events';
        const events = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const processedMetrics = processNavigationEvents(events);
        setMetrics(processedMetrics);
      } catch (error) {
        console.error('Failed to load engagement metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, [isAuthenticated, user]);

  return { ...metrics, isLoading };
};

// Process raw events into metrics
const processNavigationEvents = (events: NavigationEvent[]): EngagementMetrics => {
  const navigationEvents = events.filter(e => e.event_type === 'navigation' && e.route_to);
  const timeEvents = events.filter(e => e.event_type === 'time_spent');
  
  // Calculate metrics
  const routeCounts: Record<string, number> = {};
  const navigationPairs: Record<string, number> = {};
  
  navigationEvents.forEach(event => {
    if (event.route_to) {
      routeCounts[event.route_to] = (routeCounts[event.route_to] || 0) + 1;
    }
    
    if (event.route_from && event.route_to) {
      const pair = `${event.route_from}->${event.route_to}`;
      navigationPairs[pair] = (navigationPairs[pair] || 0) + 1;
    }
  });

  const totalTime = timeEvents.reduce((sum, event) => 
    sum + (event.metadata?.duration_ms || 0), 0
  );

  return {
    totalPageViews: navigationEvents.length,
    uniquePages: Object.keys(routeCounts).length,
    averageTimePerPage: timeEvents.length > 0 ? totalTime / timeEvents.length : 0,
    mostVisitedRoutes: Object.entries(routeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([route, count]) => ({ route, count })),
    navigationPatterns: Object.entries(navigationPairs)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([pair, frequency]) => {
        const [from, to] = pair.split('->');
        return { from, to, frequency };
      }),
    quickActionUsage: [] // Would need additional tracking for quick actions
  };
};
