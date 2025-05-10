
import React, { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRoleGuard } from '@/modules/auth/hooks/useRoleGuard';
import { AdminLeadsPage } from './AdminLeadsPage';
import { CompanyLeadsPage } from './CompanyLeadsPage';
import { UserLeadsPage } from './UserLeadsPage';

export const LeadManagementPage = () => {
  const { isAdmin, isCompany, isLoading } = useAuth();
  const { loading } = useRoleGuard({
    allowedRoles: ['admin', 'master-admin', 'company', 'user'],
    redirectTo: '/unauthorized'
  });

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Laster inn...</p>
        </div>
      </div>
    );
  }
  
  // Render appropriate view based on role
  if (isAdmin) {
    return <AdminLeadsPage />;
  } else if (isCompany) {
    return <CompanyLeadsPage />;
  } else {
    return <UserLeadsPage />;
  }
};
