
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { ModuleAccessManagerProps } from '@/types/admin';
import { AdminStatusToggle } from './moduleAccess/AdminStatusToggle';
import { ModulesList } from './moduleAccess/ModulesList';
import { AccessErrorState } from './moduleAccess/AccessErrorState';
import { AccessLoadingState } from './moduleAccess/AccessLoadingState';
import { useModuleAccess } from '../hooks/useModuleAccess';

export function ModuleAccessManager({ userId, onUpdate }: ModuleAccessManagerProps) {
  const [reason, setReason] = useState('');
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
    mutationFn: () => updateAccess(reason),
    onSuccess: () => {
      setReason('');
      if (onUpdate) {
        onUpdate();
      }
    }
  });

  // Bulk operations
  const handleSelectAll = () => {
    modules.forEach(module => {
      if (!userAccess.includes(module.id)) {
        toggleAccess(module.id);
      }
    });
  };

  const handleClearAll = () => {
    modules.forEach(module => {
      if (userAccess.includes(module.id)) {
        toggleAccess(module.id);
      }
    });
  };

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
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
      />

      <div className="space-y-4">
        <div>
          <Label htmlFor="reason">Grunn for endring (valgfri)</Label>
          <Input
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Beskriv hvorfor disse endringene gjøres..."
            className="mt-1"
          />
        </div>
        
        <div className="flex justify-end">
          <Button
            onClick={() => updateAccessMutation.mutate()}
            disabled={updateAccessMutation.isPending}
          >
            {updateAccessMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Lagrer...
              </>
            ) : (
              'Lagre endringer'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ModuleAccessManager;
