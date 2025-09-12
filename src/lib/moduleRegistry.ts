/**
 * Module Registry Service
 * Manages dynamic loading and activation of Homni modules
 */

import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useFeatureFlag } from './featureFlags';
import { logger } from '@/utils/logger';

export interface ModuleMetadata {
  id: string;
  name: string;
  description?: string;
  version: string;
  dependencies: string[];
  feature_flags: any; // Json type from Supabase
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModuleRoute {
  path: string;
  component: string;
  roles: string[];
  title?: string;
}

export interface HomniModule {
  id: string;
  name: string;
  routes: ModuleRoute[];
  dependencies: string[];
  isActive: boolean;
}

const MODULE_CACHE_KEY = 'module-metadata';

/**
 * Hook to get active modules for current user
 */
export function useActiveModules(): HomniModule[] {
  const { data: metadata = [] } = useQuery({
    queryKey: [MODULE_CACHE_KEY],
    queryFn: fetchModuleMetadata,
    staleTime: 5 * 60 * 1000,
  });

  const leadsEnabled = useFeatureFlag('leads-module');
  const boligmappaEnabled = useFeatureFlag('boligmappa-module');
  const proprEnabled = useFeatureFlag('propr-module');

  return metadata
    .filter(module => {
      if (module.name === 'leads' && !leadsEnabled) return false;
      if (module.name === 'boligmappa' && !boligmappaEnabled) return false;
      if (module.name === 'propr' && !proprEnabled) return false;
      return module.active;
    })
    .map(mapToHomniModule);
}

/**
 * Get module routes for active modules
 */
export function useModuleRoutes(): ModuleRoute[] {
  const activeModules = useActiveModules();
  return activeModules.flatMap(module => module.routes);
}

/**
 * Check if a specific module is active
 */
export function useModuleActive(moduleName: string): boolean {
  const activeModules = useActiveModules();
  return activeModules.some(module => module.name === moduleName);
}

/**
 * Fetch module metadata from database
 */
async function fetchModuleMetadata(): Promise<ModuleMetadata[]> {
  const { data, error } = await supabase
    .from('module_metadata')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) {
    logger.error('Error fetching module metadata', {
      module: 'moduleRegistry',
      action: 'fetchModuleMetadata'
    }, error);
    throw error;
  }

  return data || [];
}

/**
 * Map database metadata to HomniModule
 */
function mapToHomniModule(metadata: ModuleMetadata): HomniModule {
  const routes = getModuleRoutes(metadata.name);
  
  return {
    id: metadata.id,
    name: metadata.name,
    routes,
    dependencies: metadata.dependencies,
    isActive: metadata.active,
  };
}

/**
 * Get predefined routes for each module
 */
function getModuleRoutes(moduleName: string): ModuleRoute[] {
  const routeMap: Record<string, ModuleRoute[]> = {
    leads: [
      { path: '/leads', component: 'LeadsDashboard', roles: ['user', 'company', 'admin', 'master_admin'], title: 'Leads' },
      { path: '/leads/my', component: 'MyLeads', roles: ['user', 'company'], title: 'My Leads' },
      { path: '/leads/create', component: 'CreateLead', roles: ['user'], title: 'Create Lead' },
      { path: '/leads/manage', component: 'ManageLeads', roles: ['admin', 'master_admin'], title: 'Manage Leads' },
    ],
    boligmappa: [
      { path: '/properties', component: 'PropertiesDashboard', roles: ['user'], title: 'Properties' },
      { path: '/properties/create', component: 'CreateProperty', roles: ['user'], title: 'Add Property' },
      { path: '/properties/:id', component: 'PropertyDetails', roles: ['user'], title: 'Property Details' },
      { path: '/properties/:id/documents', component: 'PropertyDocuments', roles: ['user'], title: 'Documents' },
    ],
    propr: [
      { path: '/selling', component: 'SellingDashboard', roles: ['user'], title: 'Selling' },
      { path: '/selling/wizard', component: 'SellingWizard', roles: ['user'], title: 'Selling Wizard' },
      { path: '/selling/listings', component: 'MyListings', roles: ['user'], title: 'My Listings' },
    ],
  };

  return routeMap[moduleName] || [];
}

/**
 * Core module definitions (always available)
 */
export const CORE_MODULES: HomniModule[] = [
  {
    id: 'auth',
    name: 'auth',
    routes: [
      { path: '/login', component: 'Login', roles: ['guest'], title: 'Login' },
      { path: '/register', component: 'Register', roles: ['guest'], title: 'Register' },
      { path: '/profile', component: 'Profile', roles: ['user', 'company', 'admin', 'master_admin'], title: 'Profile' },
    ],
    dependencies: [],
    isActive: true,
  },
  {
    id: 'dashboard',
    name: 'dashboard', 
    routes: [
      { path: '/', component: 'Dashboard', roles: ['user', 'company', 'admin', 'master_admin'], title: 'Dashboard' },
      { path: '/dashboard', component: 'Dashboard', roles: ['user', 'company', 'admin', 'master_admin'], title: 'Dashboard' },
    ],
    dependencies: [],
    isActive: true,
  },
];