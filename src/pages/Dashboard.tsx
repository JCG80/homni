
import React, { useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { isLoading, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  
  // Add detailed logging to debug the role
  useEffect(() => {
    console.log("Dashboard component - User role:", role);
    console.log("Dashboard component - Auth state:", { isAuthenticated, isLoading });
    
    // Automatisk redirect basert på rolle når de er lastet
    if (!isLoading && isAuthenticated && role) {
      const dashboardPath = `/dashboard/${role}`;
      console.log(`Navigating to specific dashboard: ${dashboardPath}`);
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
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" />;
  }
  
  // Hvis rollen ikke er definert eller vi ikke har kommet til redirect ennå
  if (!role) {
    console.log("Role undefined, showing loading screen");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Finner riktig dashboard basert på din rolle...</p>
        </div>
      </div>
    );
  }
  
  // Dette burde ikke nås siden useEffect bør ha redirectet før vi kommer hit
  // men vi beholder det som fallback
  console.log(`Fallback redirect to: /dashboard/${role}`);
  return <Navigate to={`/dashboard/${role}`} />;
};

export default Dashboard;
