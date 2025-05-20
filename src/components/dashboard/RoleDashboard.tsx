
import React from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { UserRole } from '@/modules/auth/utils/roles/types';
import { Navigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Loader2 } from 'lucide-react';

interface RoleDashboardProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  title?: string;
  description?: string;
  showBreadcrumbs?: boolean;
  showSidebar?: boolean;
}

export const RoleDashboard: React.FC<RoleDashboardProps> = ({
  children,
  requiredRole,
  title = 'Dashboard',
  description,
  showBreadcrumbs = true,
  showSidebar = true
}) => {
  const { role, isAuthenticated, isLoading } = useAuth();
  
  // Check if user is loading
  if (isLoading) {
    return (
      <PageLayout 
        title="Laster..." 
        showSidebar={showSidebar}
        showBreadcrumbs={false}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
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
    <PageLayout 
      title={title} 
      description={description}
      showSidebar={showSidebar}
      showBreadcrumbs={showBreadcrumbs}
    >
      <div className="space-y-6">
        {children}
      </div>
    </PageLayout>
  );
};
