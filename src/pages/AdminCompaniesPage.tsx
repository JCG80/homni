import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { CompaniesManagementPage } from '@/modules/admin/pages/CompaniesManagementPage';
import { useAuth } from '@/modules/auth/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export const AdminCompaniesPage: React.FC = () => {
  const { profile } = useAuth();

  if (!profile || !['admin', 'master_admin'].includes(profile.role || '')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You need admin privileges to access company management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout title="Company Management">
      <div className="flex items-center gap-3 mb-8">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Company Management</h1>
          <p className="text-muted-foreground">
            Manage companies, budgets, and lead distribution
          </p>
        </div>
      </div>

      <CompaniesManagementPage />
    </DashboardLayout>
  );
};