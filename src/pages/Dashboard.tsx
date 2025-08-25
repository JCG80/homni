
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { Loader2 } from 'lucide-react';
import { routeForRole } from '@/config/routeForRole';
import { UserRole } from '@/types/auth';

export const Dashboard: React.FC = () => {
  const { isLoading, role, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Enhanced logging for debugging
  useEffect(() => {
    console.log("Dashboard - Authentication state:", { 
      isAuthenticated, 
      role, 
      isLoading, 
      userId: user?.id,
      authError: !isAuthenticated && !isLoading ? 'Not authenticated' : null
    });
  }, [role, isAuthenticated, isLoading, user]);
  
  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse"></div>
            <Loader2 className="h-10 w-10 animate-spin text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-lg mt-4">Laster inn dashboard...</p>
          <p className="text-sm text-muted-foreground">Sjekker tilgangsnivå</p>
        </div>
      </div>
    );
  }
  
  // If user is not authenticated, send them to login
  if (!isAuthenticated) {
    console.log("Dashboard - Redirecting to login: Not authenticated");
    // Store current location to return after login
    const returnPath = encodeURIComponent('/dashboard');
    return <Navigate to={`/login?returnUrl=${returnPath}`} replace />;
  }
  
  // If user is authenticated but lacks role, send them to login
  if (!role) {
    console.log("Dashboard - Redirecting to login: Missing role");
    return <Navigate to="/login" replace />;
  }
  
  // If the user has a role, send them to their role-based dashboard
  const dashboardPath = routeForRole(role as UserRole);
  console.log(`Dashboard - Redirecting to role-specific dashboard: ${dashboardPath}`);
  
  return <Navigate to={dashboardPath} replace />;
};
