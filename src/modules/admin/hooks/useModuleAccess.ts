
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Module } from '../types/types';
import { toast } from '@/hooks/use-toast';

interface UseModuleAccessProps {
  userId: string;
  onUpdate?: () => void;
}

export function useModuleAccess({ userId, onUpdate }: UseModuleAccessProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [userAccess, setUserAccess] = useState<string[]>([]);
  const [isInternalAdmin, setIsInternalAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch modules and user access
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get modules
        const { data: modulesData, error: modulesError } = await supabase
          .from('system_modules' as any)
          .select('*')
          .order('name');

        if (modulesError) {
          throw modulesError;
        }

        // Get user access
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('metadata')
          .eq('id', userId)
          .single();

        if (userError) {
          throw userError;
        }

        if (userData?.metadata) {
          const metadata = userData.metadata as Record<string, any>;
          const internal_admin = metadata.internal_admin || false;
          const module_access = metadata.module_access || [];
          
          setIsInternalAdmin(internal_admin);
          setUserAccess(module_access);
        }

        if (modulesData) {
          // Cast to Module[] to satisfy TypeScript
          setModules(modulesData as unknown as Module[]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching module access data:', error);
        setError(error instanceof Error ? error : new Error('Unknown error'));
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Toggle module access
  const toggleAccess = (moduleId: string) => {
    if (userAccess.includes(moduleId)) {
      setUserAccess(userAccess.filter((id) => id !== moduleId));
      logAudit(`Removed access to module ${moduleId}`);
    } else {
      setUserAccess([...userAccess, moduleId]);
      logAudit(`Granted access to module ${moduleId}`);
    }
  };

  // Toggle internal admin status
  const toggleInternalAdmin = () => {
    setIsInternalAdmin(!isInternalAdmin);
    logAudit(`${!isInternalAdmin ? 'Granted' : 'Removed'} internal admin status`);
  };

  // Log audit entry
  const logAudit = async (action: string) => {
    try {
      // Use any casting for tables not in the schema
      await supabase
        .from('admin_logs' as any)
        .insert({
          user_id: userId,
          action,
          timestamp: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error logging audit entry:', error);
    }
  };

  // Update user access
  const updateAccess = async () => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          metadata: {
            internal_admin: isInternalAdmin,
            module_access: userAccess,
          },
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User access updated successfully',
      });
      
      if (onUpdate) {
        onUpdate();
      }
      
      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update user access: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
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
    updateAccess,
  };
}
