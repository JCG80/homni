
import React, { useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

/**
 * Main Dashboard controller component
 * Acts as a router to direct users to the appropriate dashboard based on their role
 */
export const Dashboard: React.FC = () => {
  const { isLoading, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && isAuthenticated && role) {
      const dashboardPath = `/dashboard/${role}`;
      console.log(`Routing to role-specific dashboard: ${dashboardPath}`);
      navigate(dashboardPath, { replace: true });
    }
  }, [role, isAuthenticated, isLoading, navigate]);
  
  // Show loading state while authentication is being checked
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

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    toast({
      title: "Ingen tilgang",
      description: "Du må logge inn for å se dashbordet",
      variant: "destructive"
    });
    return <Navigate to="/login" />;
  }
  
  // If role is not determined yet, show loading
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
  
  // Redirect to the role-specific dashboard
  return <Navigate to={`/dashboard/${role}`} />;
};

export default Dashboard;
