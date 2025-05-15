
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { isLoading, role } = useAuth();
  
  // Logg informasjon for debugging
  useEffect(() => {
    console.log("Dashboard - Current role:", role);
  }, [role]);
  
  // Vis lasteskjerm mens vi sjekker autentisering
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
  
  // Hvis bruker ikke er autentisert eller mangler rolle, send dem til login
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  
  // Hvis brukeren har en rolle, send dem til deres rollebaserte dashboard
  const dashboardPath = `/dashboard/${role}`;
  console.log(`Redirecting to: ${dashboardPath}`);
  
  return <Navigate to={dashboardPath} replace />;
};
