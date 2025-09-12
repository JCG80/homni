/**
 * PHASE 1B: Module Initialization Service
 * Handles automatic module setup for users based on their roles
 * Part of Ultimate Master 2.0 implementation
 */

import { supabase } from '@/lib/supabaseClient';
import { UserRole } from '@/modules/auth/normalizeRole';
import { moduleRegistry, getModulesForRole } from './ModuleRegistry';
import { toast } from '@/components/ui/use-toast';

/**
 * Initialize modules for a user based on their role
 */
export async function initializeUserModules(userId: string, role: UserRole): Promise<boolean> {
  try {
    console.log(`[ModuleInitializer] Initializing modules for user ${userId} with role ${role}`);
    
    // Get modules available for this role
    const availableModules = getModulesForRole(role);
    console.log(`[ModuleInitializer] Found ${availableModules.length} modules for role ${role}:`, 
      availableModules.map(m => m.name));
    
    // Use the existing RPC function to initialize user module access
    const { data, error } = await supabase.rpc('initialize_user_module_access', {
      target_user_id: userId
    });
    
    if (error) {
      console.error('[ModuleInitializer] Failed to initialize user modules:', error);
      return false;
    }
    
    console.log('[ModuleInitializer] Successfully initialized user modules');
    return true;
  } catch (error) {
    console.error('[ModuleInitializer] Unexpected error during module initialization:', error);
    return false;
  }
}

/**
 * Get default modules for a role (core modules that should always be enabled)
 */
export function getCoreModulesForRole(role: UserRole): string[] {
  const coreModules: Record<UserRole, string[]> = {
    'guest': ['authentication'],
    'user': ['authentication', 'dashboard', 'property_management'],
    'company': ['authentication', 'dashboard', 'lead_management', 'analytics'],
    'content_editor': ['authentication', 'dashboard', 'content_management'],
    'admin': ['authentication', 'dashboard', 'user_management', 'company_management', 'analytics'],
    'master_admin': [
      'authentication', 
      'dashboard', 
      'user_management', 
      'company_management', 
      'system_management',
      'module_management',
      'feature_management',
      'analytics'
    ]
  };
  
  return coreModules[role] || ['authentication'];
}

/**
 * Get optional modules for a role (modules that can be enabled by choice)
 */
export function getOptionalModulesForRole(role: UserRole): string[] {
  const availableModules = getModulesForRole(role);
  const coreModules = getCoreModulesForRole(role);
  
  return availableModules
    .filter(module => !coreModules.includes(module.id))
    .map(module => module.id);
}

/**
 * Toggle a specific module for a user
 */
export async function toggleUserModule(
  userId: string, 
  moduleId: string, 
  enabled: boolean
): Promise<boolean> {
  try {
    console.log(`[ModuleInitializer] Toggling module ${moduleId} to ${enabled} for user ${userId}`);
    
    // Check if module exists and is available
    const module = moduleRegistry.getModule(moduleId);
    if (!module) {
      console.error(`[ModuleInitializer] Module ${moduleId} not found`);
      return false;
    }
    
    // Use existing bulk update function
    const { error } = await supabase.rpc('bulk_update_user_module_access', {
      target_user_id: userId,
      module_ids: [moduleId],
      enable_access: enabled,
      reason: enabled ? 'User enabled module' : 'User disabled module'
    });
    
    if (error) {
      console.error('[ModuleInitializer] Failed to toggle user module:', error);
      return false;
    }
    
    console.log(`[ModuleInitializer] Successfully toggled module ${moduleId}`);
    return true;
  } catch (error) {
    console.error('[ModuleInitializer] Unexpected error toggling module:', error);
    return false;
  }
}

/**
 * Get user's enabled modules
 */
export async function getUserEnabledModules(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_user_enabled_modules', { user_id: userId });
    
    if (error) {
      console.error('[ModuleInitializer] Failed to get user modules:', error);
      return [];
    }
    
    return data?.map((module: any) => module.id) || [];
  } catch (error) {
    console.error('[ModuleInitializer] Unexpected error getting user modules:', error);
    return [];
  }
}

/**
 * Validate user can access a module based on role and current module state
 */
export function canUserAccessModule(moduleId: string, userRole: UserRole): boolean {
  const module = moduleRegistry.getModule(moduleId);
  if (!module || !module.isActive) {
    return false;
  }
  
  return module.requiredRoles.includes(userRole);
}