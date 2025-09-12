import { useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { getNavigation, getNextSuggestions } from '@/config/navigation-consolidated';
import { useNavigationPreferences } from './useNavigationPreferences';
import { UserRole } from '@/modules/auth/normalizeRole';

export interface NavigationSuggestion {
  title: string;
  href: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  type: 'next-step' | 'frequent' | 'contextual' | 'onboarding';
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive';
  };
  icon?: React.ComponentType<{ className?: string }>;
}

export const useNavigationSuggestions = () => {
  const { role, isAuthenticated } = useAuth();
  const location = useLocation();
  const { preferences } = useNavigationPreferences();

  const currentRole = useMemo(() => {
    return isAuthenticated ? (role as UserRole) : 'guest';
  }, [isAuthenticated, role]);

  // Get contextual suggestions based on current route
  const contextualSuggestions = useMemo((): NavigationSuggestion[] => {
    const currentPath = location.pathname;
    const nextSteps = getNextSuggestions(currentPath, currentRole);
    
    return nextSteps.map(item => ({
      title: item.title,
      href: item.href,
      description: `Fortsett med ${item.title.toLowerCase()}`,
      priority: 'high' as const,
      type: 'next-step' as const,
      badge: {
        text: 'Neste steg',
        variant: 'default' as const
      },
      icon: (typeof item.icon === 'function' ? (item.icon as any) : undefined)
    }));
  }, [location.pathname, currentRole]);

  // Get frequently used routes
  const frequentSuggestions = useMemo((): NavigationSuggestion[] => {
    const { recentRoutes, favoriteRoutes } = preferences;
    const allNavItems = getNavigation(currentRole);
    
    return favoriteRoutes.map(route => {
      const navItem = allNavItems.find(item => item.href === route);
      if (!navItem) return null;
      
      return {
        title: navItem.title,
        href: navItem.href,
        description: 'Ofte brukt side',
        priority: 'medium' as const,
        type: 'frequent' as const,
        badge: {
          text: 'Favoritt',
          variant: 'secondary' as const
        },
        icon: (typeof navItem.icon === 'function' ? (navItem.icon as any) : undefined)
      };
    }).filter(Boolean) as NavigationSuggestion[];
  }, [preferences.favoriteRoutes, currentRole]);

  // Get onboarding suggestions for new users
  const onboardingSuggestions = useMemo((): NavigationSuggestion[] => {
    if (!isAuthenticated) return [];
    
    const suggestions: NavigationSuggestion[] = [];
    
    // Role-specific onboarding suggestions
    switch (currentRole) {
      case 'user':
        if (preferences.recentRoutes.length < 3) {
          suggestions.push({
            title: 'SmartStart',
            href: '/services/smart-start',
            description: 'Finn perfekte tjenester for ditt hjem',
            priority: 'high',
            type: 'onboarding',
            badge: { text: 'Anbefalt', variant: 'success' }
          });
        }
        break;
      case 'company':
        if (!preferences.recentRoutes.includes('/dashboard/company/leads')) {
          suggestions.push({
            title: 'Leads',
            href: '/dashboard/company/leads',
            description: 'Se dine potensielle kunder',
            priority: 'high',
            type: 'onboarding',
            badge: { text: 'Kom i gang', variant: 'warning' }
          });
        }
        break;
      case 'admin':
      case 'master_admin':
        if (!preferences.recentRoutes.includes('/dashboard/admin/insights')) {
          suggestions.push({
            title: 'SmartStart Insights',
            href: '/dashboard/admin/insights',
            description: 'Analyser brukerdata og trender',
            priority: 'medium',
            type: 'onboarding',
            badge: { text: 'Nytt', variant: 'secondary' }
          });
        }
        break;
    }
    
    return suggestions;
  }, [isAuthenticated, currentRole, preferences.recentRoutes]);

  // Combine all suggestions with priority sorting
  const allSuggestions = useMemo(() => {
    const combined = [
      ...contextualSuggestions,
      ...frequentSuggestions,
      ...onboardingSuggestions
    ];
    
    // Sort by priority and limit to top 5
    return combined
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 5);
  }, [contextualSuggestions, frequentSuggestions, onboardingSuggestions]);

  const getSuggestionsByType = useCallback((type: NavigationSuggestion['type']) => {
    return allSuggestions.filter(suggestion => suggestion.type === type);
  }, [allSuggestions]);

  const getSuggestionsByPriority = useCallback((priority: NavigationSuggestion['priority']) => {
    return allSuggestions.filter(suggestion => suggestion.priority === priority);
  }, [allSuggestions]);

  return {
    suggestions: allSuggestions,
    contextualSuggestions,
    frequentSuggestions, 
    onboardingSuggestions,
    getSuggestionsByType,
    getSuggestionsByPriority,
  };
};