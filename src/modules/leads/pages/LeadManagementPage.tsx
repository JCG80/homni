
import React from 'react';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { AdminLeadsPage } from './AdminLeadsPage';
import { CompanyLeadsPage } from './CompanyLeadsPage';
import { UserLeadsPage } from './UserLeadsPage';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { UserRole } from '@/modules/auth/utils/roles';

export const LeadManagementPage = () => {
  const { role } = useAuth();
  
  // Render the appropriate leads page based on user role
  const renderLeadsPage = () => {
    if (role === 'admin' || role === 'master_admin') {
      return <AdminLeadsPage />;
    } else if (role === 'company') {
      return <CompanyLeadsPage />;
    } else if (role === 'user') {
      return <UserLeadsPage />;
    }
    
    // Fallback - should not happen due to ProtectedRoute
    return <div>Uautorisert</div>;
  };
  
  return (
    <ProtectedRoute allowedRoles={['admin', 'master_admin', 'company', 'user'] as UserRole[]}>
      {renderLeadsPage()}
    </ProtectedRoute>
  );
};
