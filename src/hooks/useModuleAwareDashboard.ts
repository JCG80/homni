/**
 * PHASE 1B: Module-Aware Dashboard Hook
 * Provides dashboard routing based on user's enabled modules and role
 * Part of Ultimate Master 2.0 implementation
 */

import { useMemo } from 'react';
import { useAuthState } from '@/modules/auth/hooks/useAuthState';
import { useUserModules } from '@/modules/feature_flags/hooks/useModules';
import { moduleRegistry } from '@/modules/system/ModuleRegistry';
import { routeForRole } from '@/config/routeForRole';
import type { UserRole } from '@/modules/auth/normalizeRole';

export interface DashboardConfig {
  route: string;
  title: string;
  modules: string[];
  fallbackRoute: string;
}

/**
 * Hook to get module-aware dashboard configuration
 */
export function useModuleAwareDashboard() {
  const { user, role, isLoading: authLoading } = useAuthState();
  const { modules: userModules, isLoading: modulesLoading } = useUserModules();
  
  const isLoading = authLoading || modulesLoading;
  
  const dashboardConfig = useMemo((): DashboardConfig | null => {
    if (!user || !role || isLoading) {
      return null;
    }
    
    const enabledModuleIds = userModules.map(m => m.name?.toLowerCase().replace(/\s+/g, '_') || '');
    
    // Define dashboard priority based on role and available modules
    const dashboardOptions = getDashboardOptionsForRole(role, enabledModuleIds);
    
    // Find the best dashboard based on enabled modules
    const bestDashboard = dashboardOptions.find(option => 
      option.modules.every(moduleId => enabledModuleIds.includes(moduleId))
    ) || dashboardOptions[dashboardOptions.length - 1]; // fallback to last (most basic)
    
    return {
      ...bestDashboard,
      fallbackRoute: routeForRole(role)
    };
  }, [user, role, userModules, isLoading]);
  
  const getRecommendedModules = useMemo(() => {
    if (!role) return [];
    
    const availableModules = moduleRegistry.getModulesForRole(role);
    const enabledModuleIds = userModules.map(m => m.name?.toLowerCase().replace(/\s+/g, '_') || '');
    
    return availableModules
      .filter(module => !enabledModuleIds.includes(module.id))
      .filter(module => module.category !== 'core') // Don't recommend core modules
      .slice(0, 3); // Top 3 recommendations
  }, [role, userModules]);
  
  return {
    dashboardConfig,
    recommendedModules: getRecommendedModules,
    isLoading,
    enabledModules: userModules,
  };
}

/**
 * Get dashboard options for a specific role, ordered by preference
 */
function getDashboardOptionsForRole(role: UserRole, enabledModules: string[]): Omit<DashboardConfig, 'fallbackRoute'>[] {
  switch (role) {
    case 'master_admin':
      return [
        {
          route: '/dashboard/master-admin/system',
          title: 'System Dashboard',
          modules: ['system_management', 'module_management', 'feature_management'],
        },
        {
          route: '/dashboard/master-admin/analytics',
          title: 'Analytics Dashboard',
          modules: ['analytics', 'user_management'],
        },
        {
          route: '/dashboard/master-admin',
          title: 'Master Admin Dashboard',
          modules: ['user_management'],
        },
      ];
      
    case 'admin':
      return [
        {
          route: '/dashboard/admin/analytics',
          title: 'Admin Analytics',
          modules: ['analytics', 'lead_management'],
        },
        {
          route: '/dashboard/admin/users',
          title: 'User Management',
          modules: ['user_management', 'company_management'],
        },
        {
          route: '/dashboard/admin',
          title: 'Admin Dashboard',
          modules: ['dashboard'],
        },
      ];
      
    case 'company':
      return [
        {
          route: '/dashboard/company/leads',
          title: 'Lead Management',
          modules: ['lead_management', 'analytics'],
        },
        {
          route: '/dashboard/company/marketplace',
          title: 'Lead Marketplace',
          modules: ['lead_marketplace'],
        },
        {
          route: '/dashboard/company',
          title: 'Company Dashboard',
          modules: ['dashboard'],
        },
      ];
      
    case 'content_editor':
      return [
        {
          route: '/dashboard/content',
          title: 'Content Management',
          modules: ['content_management'],
        },
        {
          route: '/dashboard/content-editor',
          title: 'Content Editor Dashboard',
          modules: ['dashboard'],
        },
      ];
      
    case 'user':
      return [
        {
          route: '/dashboard/user/properties',
          title: 'Property Management',
          modules: ['property_management'],
        },
        {
          route: '/dashboard/user',
          title: 'User Dashboard',
          modules: ['dashboard'],
        },
      ];
      
    case 'guest':
    default:
      return [
        {
          route: '/',
          title: 'Home',
          modules: [],
        },
      ];
  }
}