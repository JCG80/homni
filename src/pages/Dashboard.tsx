
import React, { useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { isLoading, isAuthenticated, role } = useAuth();
  
  // Add detailed logging to debug the role
  useEffect(() => {
    console.log("Dashboard component - User role:", role);
    console.log("Dashboard component - Auth state:", { isAuthenticated, isLoading });
  }, [role, isAuthenticated, isLoading]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" />;
  }
  
  console.log("Current user role for redirection:", role);
  
  // Redirect to appropriate dashboard based on role
  switch (role) {
    case 'member':
      console.log("Redirecting to member dashboard");
      return <Navigate to="/dashboard/member" />;
    case 'company':
      console.log("Redirecting to company dashboard");
      return <Navigate to="/dashboard/company" />;
    case 'admin':
      console.log("Redirecting to admin dashboard");
      return <Navigate to="/dashboard/admin" />;
    case 'master_admin':
      console.log("Redirecting to master admin dashboard");
      return <Navigate to="/dashboard/master_admin" />;
    case 'content_editor':
      console.log("Redirecting to content editor dashboard");
      return <Navigate to="/dashboard/content_editor" />;
    default:
      // Default to member dashboard if role is unknown
      console.warn(`Unknown role: ${role}, defaulting to member dashboard`);
      return <Navigate to="/dashboard/member" />;
  }
};

export default Dashboard;
