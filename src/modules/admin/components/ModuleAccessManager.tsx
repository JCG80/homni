
// TODO: implement real logic later
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';

interface Module {
  id: string;
  name: string;
  description: string;
}

interface User {
  id: string;
  email: string;
  internal_admin: boolean;
  module_access: string[];
}

interface ModuleAccessManagerProps {
  userId: string;
}

export function ModuleAccessManager({ userId }: ModuleAccessManagerProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [userAccess, setUserAccess] = useState<string[]>([]);
  const [isInternalAdmin, setIsInternalAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch modules and user access
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get modules
        const { data: modulesData } = await supabase
          .from('system_modules')
          .select('*')
          .order('name');

        // Get user access
        const { data: userData } = await supabase
          .from('user_profiles')
          .select('metadata')
          .eq('id', userId)
          .single();

        if (userData?.metadata) {
          const metadata = userData.metadata as Record<string, any>;
          const internal_admin = metadata.internal_admin || false;
          const module_access = metadata.module_access || [];
          
          setIsInternalAdmin(internal_admin);
          setUserAccess(module_access);
        }

        if (modulesData) {
          setModules(modulesData);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching module access data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Update user access
  const updateAccessMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          metadata: {
            ...userAccess,
            internal_admin: isInternalAdmin,
            module_access: userAccess,
          },
        })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'User access updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update user access: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });

  // Log audit entry
  const logAudit = async (action: string) => {
    try {
      await supabase
        .from('admin_logs')
        .insert({
          user_id: userId,
          action,
          timestamp: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error logging audit entry:', error);
    }
  };

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

  // Save changes
  const saveChanges = () => {
    updateAccessMutation.mutate();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading access settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Internal Admin Status</h3>
          <p className="text-sm text-muted-foreground">
            Grant internal admin privileges to this user
          </p>
        </div>
        <Button
          variant={isInternalAdmin ? 'default' : 'outline'}
          onClick={toggleInternalAdmin}
          className={isInternalAdmin ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {isInternalAdmin ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Enabled
            </>
          ) : (
            <>
              <X className="mr-2 h-4 w-4" /> Disabled
            </>
          )}
        </Button>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Module Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((module) => (
            <div
              key={module.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <h4 className="font-medium">{module.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>
              </div>
              <Button
                variant={userAccess.includes(module.id) ? 'default' : 'outline'}
                onClick={() => toggleAccess(module.id)}
                className={
                  userAccess.includes(module.id)
                    ? 'bg-green-600 hover:bg-green-700'
                    : ''
                }
              >
                {userAccess.includes(module.id) ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Granted
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" /> Denied
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={saveChanges}
          disabled={updateAccessMutation.isPending}
        >
          {updateAccessMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
