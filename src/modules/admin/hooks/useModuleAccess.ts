
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { 
  fetchAvailableModules, 
  fetchUserModuleAccess, 
  updateUserModuleAccess 
} from '../api/moduleAccess';
import { UseModuleAccessProps } from '@/types/admin';
import type { CategorizedModules } from '@/modules/system/types/systemTypes';

export const useModuleAccess = ({ userId, onUpdate }: UseModuleAccessProps) => {
  const { user } = useAuth();
  const [modules, setModules] = useState<any[]>([]);
  const [userAccess, setUserAccess] = useState<string[]>([]);
  const [isInternalAdmin, setIsInternalAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Group modules by category for better UX
  const categorizedModules = useMemo<CategorizedModules>(() => {
    const grouped: CategorizedModules = {};
    modules.forEach(module => {
      const category = module.category || 'general';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(module);
    });
    return grouped;
  }, [modules]);

  // Fetch available modules and user's current access
  useEffect(() => {
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
        
        setLoading(false);
      } catch (err) {
        console.error('Error in useModuleAccess:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    };
    
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
      
      if (success && onUpdate) {
        onUpdate();
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
    toggleAccess,
    toggleInternalAdmin,
    updateAccess
  };
};
