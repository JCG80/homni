
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useRoleNavigation } from '@/modules/auth/hooks/roles/useRoleNavigation';

export const Dashboard: React.FC = () => {
  const { isLoading } = useAuth();
  const { redirectToDashboard, isLoading: isNavigationLoading } = useRoleNavigation({ autoRedirect: true });
  
  if (isLoading || isNavigationLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Omdirigerer til riktig dashbord...</p>
        </div>
      </div>
    );
  }
  
  return null; // Redirection happens in the hook
};
