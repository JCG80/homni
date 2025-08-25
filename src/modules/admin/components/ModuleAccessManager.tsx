
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { ModuleAccessManagerProps } from '@/types/admin';
import { AdminStatusToggle } from './moduleAccess/AdminStatusToggle';
import { ModulesList } from './moduleAccess/ModulesList';
import { AccessErrorState } from './moduleAccess/AccessErrorState';
import { AccessLoadingState } from './moduleAccess/AccessLoadingState';
import { useModuleAccess } from '../hooks/useModuleAccess';

export function ModuleAccessManager({ userId, onUpdate }: ModuleAccessManagerProps) {
  const {
    modules,
    userAccess,
    isInternalAdmin,
    loading,
    error,
    toggleAccess,
    toggleInternalAdmin,
    updateAccess
  } = useModuleAccess({ userId, onUpdate });

  // Update user access mutation
  const updateAccessMutation = useMutation({
    mutationFn: updateAccess,
    onSuccess: () => {
      if (onUpdate) {
        onUpdate();
      }
    }
  });

  // Refresh page for error
  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return <AccessLoadingState />;
  }

  if (error) {
    return <AccessErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-6">
      <AdminStatusToggle 
        isInternalAdmin={isInternalAdmin} 
        onToggle={toggleInternalAdmin} 
      />

      <ModulesList
        modules={modules}
        userAccess={userAccess}
        onToggleAccess={toggleAccess}
      />

      <div className="flex justify-end">
        <Button
          onClick={() => updateAccessMutation.mutate()}
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

export default ModuleAccessManager;
