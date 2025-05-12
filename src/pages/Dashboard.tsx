
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { isAuthenticated, isLoading, role, isAdmin, isMasterAdmin } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Redirect based on role
    if (isMasterAdmin) {
      navigate('/master-admin');
    } else if (isAdmin) {
      navigate('/admin');
    } else if (role === 'company') {
      navigate('/dashboard/company');
    } else {
      // Default to member dashboard
      navigate('/dashboard/member');
    }
  }, [isAuthenticated, isLoading, role, isAdmin, isMasterAdmin, navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <p className="text-lg">Omdirigerer til riktig dashbord...</p>
      </div>
    </div>
  );
};
