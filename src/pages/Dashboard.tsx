
import React from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useRoleNavigation } from '@/modules/auth/hooks/roles/useRoleNavigation';
import { Navigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { isLoading, isAuthenticated, role } = useAuth();
  
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
    return <Navigate to="/login" />;
  }
  
  // Redirect to appropriate dashboard based on role
  switch (role) {
    case 'member':
      return <Navigate to="/dashboard/member" />;
    case 'company':
      return <Navigate to="/dashboard/company" />;
    case 'admin':
      return <Navigate to="/dashboard/admin" />;
    case 'master_admin':
      return <Navigate to="/dashboard/master_admin" />;
    case 'content_editor':
      return <Navigate to="/dashboard/content_editor" />;
    default:
      // Default to member dashboard if role is unknown
      return <Navigate to="/dashboard/member" />;
  }
};

export default Dashboard;
