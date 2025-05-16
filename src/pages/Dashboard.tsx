
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { isLoading, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Enhanced logging for debugging
  useEffect(() => {
    console.log("Dashboard - Authentication state:", { isAuthenticated, role, isLoading });
  }, [role, isAuthenticated, isLoading]);
  
  // Show loading screen while checking authentication
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
  
  // If user is not authenticated, send them to login
  if (!isAuthenticated) {
    console.log("Dashboard - Redirecting to login: Not authenticated");
    return <Navigate to="/login" replace />;
  }
  
  // If user is authenticated but lacks role, send them to login
  if (!role) {
    console.log("Dashboard - Redirecting to login: Missing role");
    return <Navigate to="/login" replace />;
  }
  
  // If the user has a role, send them to their role-based dashboard
  const dashboardPath = `/dashboard/${role}`;
  console.log(`Dashboard - Redirecting to role-specific dashboard: ${dashboardPath}`);
  
  return <Navigate to={dashboardPath} replace />;
};
