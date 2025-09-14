
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { getSystemModules, toggleSystemModule } from '../services/systemModules';
import { SystemModule } from '../types/systemTypes';

export const useSystemModules = () => {
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const data = await getSystemModules();
        setModules(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching modules:', err);
        setError('Failed to load system modules');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const handleToggleModule = async (moduleId: string, isActive: boolean) => {
    try {
      const success = await toggleSystemModule(moduleId, isActive);
      
      if (success) {
        // Update local state
        setModules(prev => 
          prev.map(mod => 
            mod.id === moduleId ? { ...mod, is_active: isActive } : mod
          )
        );
        
        toast({
          title: `Module ${isActive ? 'activated' : 'deactivated'}`,
          description: `Module status has been updated.`,
        });
      } else {
        throw new Error('Could not update module status');
      }
    } catch (error) {
      console.error('Error toggling module:', error);
      toast({
        title: 'Update Failed',
        description: 'Could not change module status. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return {
    modules,
    loading,
    error,
    handleToggleModule
  };
};
