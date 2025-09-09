
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { 
  fetchAvailableModules, 
  fetchUserModuleAccess, 
  updateUserModuleAccess,
  bulkUpdateUserModuleAccess,
  fetchModuleAccessAudit
} from '../api/moduleAccess';
import { UseModuleAccessProps } from '@/types/admin';
import type { CategorizedModules } from '@/modules/system/types/systemTypes';

interface ModuleAuditLog {
  id: string;
  action: string;
  reason?: string;
  created_at: string;
  admin_user_id?: string;
  metadata?: any;
}

export const useModuleAccess = ({ userId, onUpdate }: UseModuleAccessProps) => {
  const { user } = useAuth();
  const [modules, setModules] = useState<any[]>([]);
  const [userAccess, setUserAccess] = useState<string[]>([]);
  const [isInternalAdmin, setIsInternalAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [auditLogs, setAuditLogs] = useState<ModuleAuditLog[]>([]);

  // Group modules by category with enhanced sorting
  const categorizedModules = useMemo<CategorizedModules>(() => {
    const grouped: CategorizedModules = {};
    modules
      .sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999))
      .forEach(module => {
        const category = module.category || 'general';
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(module);
      });
    
    // Sort categories by priority
    const sortedGrouped: CategorizedModules = {};
    const categoryOrder = ['admin', 'core', 'content', 'company', 'general'];
    
    categoryOrder.forEach(category => {
      if (grouped[category]) {
        sortedGrouped[category] = grouped[category];
      }
    });
    
    // Add any remaining categories
    Object.keys(grouped).forEach(category => {
      if (!categoryOrder.includes(category)) {
        sortedGrouped[category] = grouped[category];
      }
    });
    
    return sortedGrouped;
  }, [modules]);

  // Fetch data with audit logs
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch available modules
      const availableModules = await fetchAvailableModules();
      setModules(availableModules);
      
      // Fetch user's current module access
      const { moduleAccess, isInternalAdmin } = await fetchUserModuleAccess(userId);
      setUserAccess(moduleAccess);
      setIsInternalAdmin(isInternalAdmin);
      
      // Fetch audit logs
      const logs = await fetchModuleAccessAudit(userId);
      setAuditLogs(logs);
      
      setLoading(false);
    } catch (err) {
      console.error('Error in useModuleAccess:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
    }
  };

  // Fetch data on mount and userId change
  useEffect(() => {
    fetchData();
  }, [userId]);

  // Toggle specific module access
  const toggleAccess = (moduleId: string) => {
    setUserAccess(prev => {
      if (prev.includes(moduleId)) {
        return prev.filter(id => id !== moduleId);
      } else {
        return [...prev, moduleId];
      }
    });
  };

  // Toggle internal admin status
  const toggleInternalAdmin = () => {
    setIsInternalAdmin(prev => !prev);
  };

  // Bulk operations for category-based access management
  const bulkToggleCategory = async (category: string, enable: boolean, reason?: string) => {
    if (!user?.id) return false;
    
    const categoryModules = categorizedModules[category] || [];
    const moduleIds = categoryModules.map(m => m.id);
    
    try {
      const success = await bulkUpdateUserModuleAccess(userId, moduleIds, enable, reason);
      if (success) {
        if (enable) {
          setUserAccess(prev => [...new Set([...prev, ...moduleIds])]);
        } else {
          setUserAccess(prev => prev.filter(id => !moduleIds.includes(id)));
        }
        await fetchData(); // Refresh audit logs
        if (onUpdate) onUpdate();
      }
      return success;
    } catch (err) {
      console.error('Error in bulk category toggle:', err);
      return false;
    }
  };

  // Grant all core modules (common operation)
  const grantCoreModules = async (reason?: string) => {
    return bulkToggleCategory('core', true, reason || 'Grant core module access');
  };

  // Grant all admin modules (for admin promotions)
  const grantAdminModules = async (reason?: string) => {
    return bulkToggleCategory('admin', true, reason || 'Grant admin module access');
  };

  // Revoke all modules (for access removal)
  const revokeAllModules = async (reason?: string) => {
    if (!user?.id) return false;
    
    try {
      const allModuleIds = modules.map(m => m.id);
      const success = await bulkUpdateUserModuleAccess(userId, allModuleIds, false, reason);
      if (success) {
        setUserAccess([]);
        await fetchData();
        if (onUpdate) onUpdate();
      }
      return success;
    } catch (err) {
      console.error('Error revoking all modules:', err);
      return false;
    }
  };

  // Save changes to the database
  const updateAccess = async (reason?: string) => {
    if (!user?.id) return false;
    
    try {
      const success = await updateUserModuleAccess(
        userId,
        user.id,
        userAccess,
        isInternalAdmin,
        reason
      );
      
      if (success) {
        await fetchData(); // Refresh data including audit logs
        if (onUpdate) onUpdate();
      }
      
      return success;
    } catch (err) {
      console.error('Error updating module access:', err);
      return false;
    }
  };

  return {
    modules,
    categorizedModules,
    userAccess,
    isInternalAdmin,
    loading,
    error,
    auditLogs,
    toggleAccess,
    toggleInternalAdmin,
    updateAccess,
    bulkToggleCategory,
    grantCoreModules,
    grantAdminModules,
    revokeAllModules,
    refreshData: fetchData
  };
};
