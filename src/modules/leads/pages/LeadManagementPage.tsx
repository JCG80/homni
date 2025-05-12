
import React from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { AdminLeadsPage } from './AdminLeadsPage';
import { CompanyLeadsPage } from './CompanyLeadsPage';
import { UserLeadsPage } from './UserLeadsPage';
import { Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

/**
 * Lead Management Page that displays different content based on user role
 */
export const LeadManagementPage: React.FC = () => {
  const { isLoading, isAuthenticated, role } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Laster inn...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Render the appropriate leads page based on user role
  switch (role) {
    case 'admin':
    case 'master_admin':
      return <AdminLeadsPage />;
    case 'company':
      return <CompanyLeadsPage />;
    case 'member':
      return <UserLeadsPage />;
    default:
      // If role is unrecognized, redirect to unauthorized
      return <Navigate to="/unauthorized" />;
  }
};

export default LeadManagementPage;
