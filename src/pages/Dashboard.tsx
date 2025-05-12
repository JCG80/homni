
import React, { useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { isLoading, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && isAuthenticated && role) {
      const dashboardPath = `/dashboard/${role}`;
      console.log(`Navigating to role-specific dashboard: ${dashboardPath}`);
      navigate(dashboardPath, { replace: true });
    }
  }, [role, isAuthenticated, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Laster inn dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!role) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Finner riktig dashboard basert på din rolle...</p>
        </div>
      </div>
    );
  }
  
  return <Navigate to={`/dashboard/${role}`} />;
};

export default Dashboard;
