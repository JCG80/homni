
import React from 'react';
import { Loader } from 'lucide-react';
import { ModuleAccessManager } from '../ModuleAccessManager';
import { CompanyProfile } from '../../types/types';

interface ModuleAccessTabProps {
  company: CompanyProfile;
  isLoading: boolean;
  onUpdate: () => void;
}

export function ModuleAccessTab({ company, isLoading, onUpdate }: ModuleAccessTabProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="h-6 w-6 animate-spin" />
        <span className="ml-2">Laster modultilgang...</span>
      </div>
    );
  }
  
  if (!company.user_id) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Ingen bruker tilknyttet denne bedriften.
      </div>
    );
  }

  return (
    <ModuleAccessManager 
      userId={company.user_id} 
      onUpdate={onUpdate}
    />
  );
}
