
import React from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { DashboardLayout } from '@/components/dashboard';
import { RoleBasedNavigation } from '@/components/navigation/RoleBasedNavigation';
import { UserRole } from '@/modules/auth/utils/roles/types';
import { Navigate } from 'react-router-dom';

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
    <DashboardLayout title={title}>
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 lg:w-72">
          <div className="sticky top-20">
            <RoleBasedNavigation variant="vertical" className="shadow-sm bg-card rounded-lg p-4" />
          </div>
        </aside>
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </DashboardLayout>
  );
};
