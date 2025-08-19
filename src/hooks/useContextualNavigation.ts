import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { useNavigationContext } from './useNavigationContext';
import { UserRole } from '@/modules/auth/utils/roles/types';
import { navUser, navControl } from '@/routes/navConfig';

interface ContextualSuggestion {
  id: string;
  title: string;
  description: string;
  action: () => void;
  priority: 'high' | 'medium' | 'low';
  category: 'navigation' | 'action' | 'shortcut';
}

interface ContextualNavigationState {
  suggestions: ContextualSuggestion[];
  quickActions: ContextualSuggestion[];
  isLoading: boolean;
}

export function useContextualNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, isAuthenticated } = useAuth();
  const { getRecommendedRoutes, isFrequentRoute } = useNavigationContext();
  
  const [state, setState] = useState<ContextualNavigationState>({
    suggestions: [],
    quickActions: [],
    isLoading: false,
  });

  const generateSuggestions = useCallback(() => {
    if (!isAuthenticated || !role) return;

    const currentPath = location.pathname;
    const userRole = role as UserRole;
    const recommendations = getRecommendedRoutes(userRole);
    
    const suggestions: ContextualSuggestion[] = [];
    const quickActions: ContextualSuggestion[] = [];

    // Navigation suggestions based on current route
    if (currentPath === '/') {
      if (userRole !== 'guest') {
        suggestions.push({
          id: 'goto-dashboard',
          title: 'Gå til Dashboard',
          description: 'Se oversikt over dine aktiviteter',
          action: () => navigate('/dashboard'),
          priority: 'high',
          category: 'navigation',
        });
      }
      
      suggestions.push({
        id: 'browse-companies',
        title: 'Utforsk Partnere',
        description: 'Se tilgjengelige tjenester fra våre partnere',
        action: () => navigate('/companies'),
        priority: 'medium',
        category: 'navigation',
      });
    }

    // Admin suggestions
    if (currentPath.startsWith('/admin')) {
      if (userRole === 'master_admin') {
        suggestions.push({
          id: 'manage-users',
          title: 'Administrer Brukere',
          description: 'Håndter brukerkontoer og tilganger',
          action: () => navigate('/admin/members'),
          priority: 'high',
          category: 'action',
        });
      }
      
      if (['admin', 'master_admin'].includes(userRole)) {
        suggestions.push({
          id: 'view-leads',
          title: 'Se Leads',
          description: 'Følg opp nye henvendelser',
          action: () => navigate('/admin/leads'),
          priority: 'medium',
          category: 'action',
        });
      }
    }

    // Dashboard suggestions
    if (currentPath === '/dashboard') {
      const userNav = navUser[userRole] || [];
      const controlNav = navControl[userRole] || [];
      
      [...userNav, ...controlNav].slice(0, 3).forEach((navItem, index) => {
        if (navItem.href !== '/dashboard') {
          suggestions.push({
            id: `nav-${navItem.href}`,
            title: `Gå til ${navItem.label}`,
            description: `Utforsk ${navItem.label.toLowerCase()}`,
            action: () => navigate(navItem.href),
            priority: index === 0 ? 'high' : 'medium',
            category: 'navigation',
          });
        }
      });
    }

    // Quick actions based on role
    if (['admin', 'master_admin'].includes(userRole)) {
      quickActions.push({
        id: 'switch-to-user',
        title: 'Brukermodus',
        description: 'Bytt til brukervisning',
        action: () => navigate('/dashboard'),
        priority: 'medium',
        category: 'shortcut',
      });
    } else {
      if (['admin', 'master_admin'].includes(userRole)) {
        quickActions.push({
          id: 'switch-to-admin',
          title: 'Admin Panel',
          description: 'Gå til administrasjon',
          action: () => navigate('/admin'),
          priority: 'medium',
          category: 'shortcut',
        });
      }
    }

    // Add frequent routes as suggestions
    recommendations.slice(0, 2).forEach((route) => {
      if (route !== currentPath && isFrequentRoute(route)) {
        suggestions.push({
          id: `frequent-${route}`,
          title: `Tilbake til ${route.split('/').pop()?.replace('-', ' ')}`,
          description: 'Ofte besøkt side',
          action: () => navigate(route),
          priority: 'low',
          category: 'shortcut',
        });
      }
    });

    setState({
      suggestions: suggestions.slice(0, 5), // Limit to 5 suggestions
      quickActions: quickActions.slice(0, 3), // Limit to 3 quick actions
      isLoading: false,
    });
  }, [location.pathname, role, isAuthenticated, navigate, getRecommendedRoutes, isFrequentRoute]);

  useEffect(() => {
    setState(prev => ({ ...prev, isLoading: true }));
    const timer = setTimeout(generateSuggestions, 500); // Small delay for better UX
    return () => clearTimeout(timer);
  }, [generateSuggestions]);

  return state;
}