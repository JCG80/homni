
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Loader, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ModuleAccessManagerProps {
  userId: string;
  onUpdate: () => void;
}

// List of available modules
const AVAILABLE_MODULES = [
  { id: 'leads', name: 'Leads' },
  { id: 'finance', name: 'Økonomi' },
  { id: 'content', name: 'Innhold' },
  { id: 'properties', name: 'Eiendommer' },
  { id: 'insurance', name: 'Forsikring' },
  { id: 'settings', name: 'Innstillinger' },
  { id: 'statistics', name: 'Statistikk' }
];

export function ModuleAccessManager({ userId, onUpdate }: ModuleAccessManagerProps) {
  const queryClient = useQueryClient();
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isInternalAdmin, setIsInternalAdmin] = useState(false);
  
  // Fetch user's current module access
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user-module-access', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('metadata')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      // Initialize the selected modules and internal admin state
      if (data?.metadata) {
        setIsInternalAdmin(!!data.metadata.internal_admin);
        setSelectedModules(data.metadata.module_access || []);
      }
      
      return data;
    }
  });
  
  // Update module access mutation
  const { mutate: updateAccess, isLoading: isUpdating } = useMutation({
    mutationFn: async () => {
      // Get the current metadata
      const { data: currentUser } = await supabase
        .from('user_profiles')
        .select('metadata')
        .eq('id', userId)
        .single();
      
      const currentMetadata = currentUser?.metadata || {};
      
      // Update the metadata with the new module access and internal admin flag
      const { error } = await supabase
        .from('user_profiles')
        .update({
          metadata: {
            ...currentMetadata,
            module_access: selectedModules,
            internal_admin: isInternalAdmin
          }
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Log this action to the admin_logs table (if it exists)
      try {
        await supabase.from('admin_logs').insert({
          user_id: userId,
          module: 'access',
          action: 'update_access',
          details: {
            module_access: selectedModules,
            internal_admin: isInternalAdmin
          }
        });
      } catch (logError) {
        console.error('Failed to log admin action:', logError);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Modultilgang oppdatert',
        description: 'Brukerens modultilgang er oppdatert.',
      });
      queryClient.invalidateQueries({ queryKey: ['user-module-access'] });
      onUpdate();
    },
    onError: (error) => {
      console.error('Failed to update module access:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke oppdatere modultilgang.',
        variant: 'destructive',
      });
    }
  });
  
  const toggleModule = (moduleId: string) => {
    setSelectedModules(current => 
      current.includes(moduleId) 
        ? current.filter(id => id !== moduleId) 
        : [...current, moduleId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h3 className="text-lg font-medium">Modultilgang</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="internal-admin"
            checked={isInternalAdmin}
            onCheckedChange={(checked) => setIsInternalAdmin(!!checked)}
          />
          <label htmlFor="internal-admin" className="text-sm font-medium">
            Intern administrator (full tilgang til alle moduler)
          </label>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader className="h-6 w-6 animate-spin" />
          <span className="ml-2">Laster modultilgang...</span>
        </div>
      ) : (
        <>
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AVAILABLE_MODULES.map(module => (
                <div key={module.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`module-${module.id}`}
                    checked={selectedModules.includes(module.id)}
                    onCheckedChange={() => toggleModule(module.id)}
                    disabled={isInternalAdmin} // Disabled if internal admin is checked
                  />
                  <label htmlFor={`module-${module.id}`} className="text-sm font-medium">
                    {module.name}
                  </label>
                </div>
              ))}
            </div>
          </Card>
          
          <div className="flex justify-end mt-6">
            <Button
              onClick={() => updateAccess()}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Lagrer...
                </>
              ) : 'Lagre modultilgang'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
