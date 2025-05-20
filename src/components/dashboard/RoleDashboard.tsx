
import React from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { DashboardLayout } from '@/components/dashboard';
import { UserRole } from '@/modules/auth/utils/roles/types';
import { Navigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';

interface RoleDashboardProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  title?: string;
}

export const RoleDashboard: React.FC<RoleDashboardProps> = ({
  children,
  requiredRole,
  title = 'Dashboard'
}) => {
  const { role, isAuthenticated, isLoading } = useAuth();
  
  // Check if user is loading
  if (isLoading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role access if requiredRole is specified
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Special case: master_admin has access to everything
    if (role === 'master_admin') {
      // Allow access
    } 
    // Check if user has required role
    else if (!allowedRoles.includes(role as UserRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  return (
    <PageLayout title={title} showSidebar={true}>
      <div className="space-y-6">
        {children}
      </div>
    </PageLayout>
  );
};
