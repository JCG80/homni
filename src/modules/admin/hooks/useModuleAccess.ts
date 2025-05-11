
import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { 
  fetchAvailableModules, 
  fetchUserModuleAccess, 
  updateUserModuleAccess 
} from '../api/moduleAccess';

interface UseModuleAccessProps {
  userId: string;
  onUpdate?: () => void;
}

export const useModuleAccess = ({ userId, onUpdate }: UseModuleAccessProps) => {
  const { user } = useAuth();
  const [modules, setModules] = useState<any[]>([]);
  const [userAccess, setUserAccess] = useState<string[]>([]);
  const [isInternalAdmin, setIsInternalAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
  const updateAccess = async () => {
    if (!user?.id) return false;
    
    try {
      const success = await updateUserModuleAccess(
        userId,
        user.id,
        userAccess,
        isInternalAdmin
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
    userAccess,
    isInternalAdmin,
    loading,
    error,
    toggleAccess,
    toggleInternalAdmin,
    updateAccess
  };
};
