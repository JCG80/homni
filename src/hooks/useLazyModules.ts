import React, { lazy, ComponentType, useCallback } from 'react';
import { UserRole } from '@/modules/auth/utils/roles/types';

// Lazy load business modules
export const LazyLeadEngine = lazy(() => 
  import('@/modules/leads/components/LeadEngineInterface').then(m => ({ 
    default: m.LeadEngineInterface 
  }))
);

export const LazyPropertyManagement = lazy(() => 
  import('@/modules/property/components/PropertyManagementInterface').then(m => ({ 
    default: m.PropertyManagementInterface 
  }))
);

export const LazyDIYSelling = lazy(() => 
  import('@/modules/sales/components/DIYSellingInterface').then(m => ({ 
    default: m.DIYSellingInterface 
  }))
);

// Lazy load admin modules with fallbacks
const AdminDashboardFallback = () => React.createElement('div', {}, 'Admin Dashboard kommer snart');
const LeadDistributionFallback = () => React.createElement('div', {}, 'Lead-distribusjon kommer snart');

export const LazyAdminDashboard = lazy(() => 
  Promise.resolve({ default: AdminDashboardFallback })
);

export const LazyLeadDistribution = lazy(() => 
  Promise.resolve({ default: LeadDistributionFallback })
);

// Module registry for dynamic loading
interface ModuleConfig {
  component: ComponentType<any>;
  preload?: boolean;
  roles: UserRole[];
}

export const moduleRegistry: Record<string, ModuleConfig> = {
  'lead-engine': {
    component: LazyLeadEngine,
    preload: true,
    roles: ['user', 'company', 'admin', 'master_admin']
  },
  'property-management': {
    component: LazyPropertyManagement,
    preload: true,
    roles: ['user', 'company', 'admin', 'master_admin']
  },
  'diy-selling': {
    component: LazyDIYSelling,
    preload: false,
    roles: ['user', 'company']
  },
  'admin-dashboard': {
    component: LazyAdminDashboard,
    preload: false,
    roles: ['admin', 'master_admin']
  },
  'lead-distribution': {
    component: LazyLeadDistribution,
    preload: false,
    roles: ['admin', 'master_admin']
  }
};

// Hook for preloading modules based on user role with enhanced performance
export const useLazyModules = (role: UserRole | string | null) => {
  const preloadModules = useCallback(() => {
    if (!role) return Promise.resolve();

    const preloadPromises = Object.entries(moduleRegistry).map(async ([moduleId, config]) => {
      if (config.preload && config.roles.includes(role as UserRole)) {
        try {
          const LazyComponent = config.component as any;
          if (LazyComponent._payload && LazyComponent._payload._fn) {
            await LazyComponent._payload._fn();
          }
          return { moduleId, success: true };
        } catch (error) {
          console.warn(`Failed to preload module ${moduleId}:`, error);
          return { moduleId, success: false, error };
        }
      }
      return { moduleId, success: true, skipped: true };
    });

    return Promise.allSettled(preloadPromises);
  }, [role]);

  const loadModule = (moduleId: string): ComponentType<any> | null => {
    const config = moduleRegistry[moduleId];
    if (!config || !role || !config.roles.includes(role as UserRole)) {
      return null;
    }
    return config.component;
  };

  const getAvailableModules = (): string[] => {
    if (!role) return [];
    
    return Object.entries(moduleRegistry)
      .filter(([_, config]) => config.roles.includes(role as UserRole))
      .map(([moduleId]) => moduleId);
  };

  const preloadSpecificModule = useCallback(async (moduleId: string) => {
    const config = moduleRegistry[moduleId];
    if (!config || !role || !config.roles.includes(role as UserRole)) {
      return false;
    }

    try {
      const LazyComponent = config.component as any;
      if (LazyComponent._payload && LazyComponent._payload._fn) {
        await LazyComponent._payload._fn();
      }
      return true;
    } catch (error) {
      console.warn(`Failed to preload module ${moduleId}:`, error);
      return false;
    }
  }, [role]);

  return {
    preloadModules,
    loadModule,
    getAvailableModules,
    preloadSpecificModule,
    moduleRegistry
  };
};