import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { AdminBreadcrumbs } from './AdminBreadcrumbs';
import { useAuth } from '@/modules/auth/hooks';
import { Navigate } from 'react-router-dom';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isAdmin, isMasterAdmin } = useAuth();

  // Redirect non-admin users
  if (!isAuthenticated || (!isAdmin && !isMasterAdmin)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Admin-specific styling with distinct color scheme */}
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <AdminBreadcrumbs />
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};