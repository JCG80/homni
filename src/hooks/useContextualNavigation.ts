import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { useNavigationContext } from './useNavigationContext';
import { UserRole } from '@/modules/auth/normalizeRole';
import { navUser, navControl } from '@/config/navigation';

interface ContextualSuggestion {
  id: string;
  title: string;
  description: string;
  action: () => void;
  priority: 'high' | 'medium' | 'low';
  category: 'navigation' | 'action' | 'shortcut' | 'workflow' | 'business' | 'admin' | 'frequent';
}

interface ContextualNavigationState {
  suggestions: ContextualSuggestion[];
  quickActions: ContextualSuggestion[];
  isLoading: boolean;
}

export function useContextualNavigation() {
  // Add Router context safety checks
  let location, navigate;
  try {
    location = useLocation();
    navigate = useNavigate();
  } catch (error) {
    // Fallback when Router context is not available
    console.warn('Router context not available in useContextualNavigation');
    return {
      suggestions: [],
      quickActions: [],
      isLoading: false,
    };
  }
  
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

    // Business workflow suggestions based on current route
    if (currentPath === '/leads' && ['user', 'company'].includes(userRole)) {
      suggestions.push({
        id: 'lead-to-property',
        title: 'Registrer eiendom',
        description: 'Neste steg: Dokumenter eiendomsinformasjon for dette leddet',
        action: () => navigate('/property'),
        priority: 'high',
        category: 'workflow'
      });
      suggestions.push({
        id: 'lead-to-sales',
        title: 'Start salgsoppsett',
        description: 'Opprett DIY salg basert på dette leddet',
        action: () => navigate('/sales'),
        priority: 'medium',
        category: 'workflow'
      });
    }

    if (currentPath === '/property' && ['user', 'company'].includes(userRole)) {
      suggestions.push({
        id: 'property-to-sales',
        title: 'Opprett salg',
        description: 'Start salgsoppsett for denne eiendommen',
        action: () => navigate('/sales'),
        priority: 'high',
        category: 'workflow'
      });
      suggestions.push({
        id: 'property-to-leads',
        title: 'Finn flere leads',
        description: 'Søk etter lignende eiendommer',
        action: () => navigate('/leads'),
        priority: 'medium',
        category: 'workflow'
      });
    }

    if (currentPath === '/sales' && ['user', 'company'].includes(userRole)) {
      suggestions.push({
        id: 'sales-to-property',
        title: 'Oppdater eiendom',
        description: 'Legg til flere detaljer i eiendomsregisteret',
        action: () => navigate('/property'),
        priority: 'medium',
        category: 'workflow'
      });
      suggestions.push({
        id: 'sales-to-leads',
        title: 'Finn nye leads',
        description: 'Søk etter potensielle kjøpere',
        action: () => navigate('/leads'),
        priority: 'medium',
        category: 'workflow'
      });
    }

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

    // Admin suggestions and quick actions
    if (currentPath.startsWith('/admin')) {
      if (['admin', 'master_admin'].includes(userRole)) {
        quickActions.push({
          id: 'admin-leads',
          title: 'Lead-distribusjon',
          description: 'Administrer alle leads i systemet',
          action: () => navigate('/admin/leads'),
          priority: 'high',
          category: 'admin'
        });
        
        suggestions.push({
          id: 'view-leads',
          title: 'Se Leads',
          description: 'Følg opp nye henvendelser',
          action: () => navigate('/admin/leads'),
          priority: 'medium',
          category: 'action',
        });
      }
      
      if (userRole === 'master_admin') {
        suggestions.push({
          id: 'manage-users',
          title: 'Administrer Brukere',
          description: 'Håndter brukerkontoer og tilganger',
          action: () => navigate('/admin/members'),
          priority: 'high',
          category: 'action',
        });
        suggestions.push({
          id: 'manage-modules',
          title: 'Moduler',
          description: 'Konfigurer systemmoduler',
          action: () => navigate('/admin/modules'),
          priority: 'medium',
          category: 'admin',
        });
      }
    }

    // Dashboard suggestions with business quick actions
    if (currentPath === '/dashboard') {
      if (userRole === 'user') {
        quickActions.push({
          id: 'quick-lead-search',
          title: 'Søk leads',
          description: 'Finn relevante kundeemner',
          action: () => navigate('/leads'),
          priority: 'high',
          category: 'business'
        });
        quickActions.push({
          id: 'quick-property-add',
          title: 'Legg til eiendom',
          description: 'Registrer ny eiendom',
          action: () => navigate('/property'),
          priority: 'medium',
          category: 'business'
        });
      }
      if (userRole === 'company') {
        quickActions.push({
          id: 'quick-lead-management',
          title: 'Administrer leads',
          description: 'Se alle dine leads og pipeline',
          action: () => navigate('/leads/manage'),
          priority: 'high',
          category: 'business'
        });
        quickActions.push({
          id: 'quick-sales-pipeline',
          title: 'Salg pipeline',
          description: 'Oversikt over aktive salg',
          action: () => navigate('/sales/pipeline'),
          priority: 'medium',
          category: 'business'
        });
      }
      
      const userNav = navUser[userRole] || [];
      const controlNav = navControl[userRole] || [];
      
      [...userNav, ...controlNav].slice(0, 2).forEach((navItem, index) => {
        if (navItem.href !== '/dashboard' && !navItem.href.includes('/dashboard/')) {
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