
import React from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { UserRole } from '@/types/auth';
import { Navigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Loader2 } from 'lucide-react';

interface RoleDashboardProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  allowAnyAuthenticated?: boolean;
  title?: string;
  description?: string;
  showBreadcrumbs?: boolean;
  showSidebar?: boolean;
}

export const RoleDashboard: React.FC<RoleDashboardProps> = ({
  children,
  requiredRole,
  allowAnyAuthenticated = false,
  title = 'Dashboard',
  description,
  showBreadcrumbs = true,
  showSidebar = true
}) => {
  const { role, isAuthenticated, isLoading, profile, user } = useAuth();
  
  // Get effective role from either role prop or profile data
  const effectiveRole = role || profile?.role || (user?.role);
  
  console.log("RoleDashboard - State:", { 
    role, 
    effectiveRole,
    isAuthenticated, 
    isLoading, 
    requiredRole, 
    allowAnyAuthenticated,
    profileRole: profile?.role,
    userRole: user?.role
  });
  
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
  
  // If allowAnyAuthenticated is true and user is authenticated, allow access
  if (allowAnyAuthenticated && isAuthenticated) {
    console.log("RoleDashboard - Allowing any authenticated user");
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
  }
  
  // Check role access if requiredRole is specified
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // If role is still loading or undefined, wait for it to load
    if (!effectiveRole || effectiveRole === null || effectiveRole === undefined) {
      console.log("RoleDashboard - Role not ready, showing loading state");
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
    
    // Special case: master_admin has access to everything
    if (effectiveRole === 'master_admin') {
      console.log("RoleDashboard - Master admin access granted");
      // Allow access
    } 
    // Check if user has required role
    else if (!allowedRoles.includes(effectiveRole as UserRole)) {
      console.log("RoleDashboard - Access denied, redirecting to unauthorized");
      return <Navigate to="/unauthorized" replace />;
    }
    
    console.log("RoleDashboard - Role access granted for:", effectiveRole);
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
