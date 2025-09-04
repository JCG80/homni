/**
 * Company budget management page
 */

import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { BudgetManagement } from '@/components/budget/BudgetManagement';
import { useAuth } from '@/modules/auth/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

export const CompanyBudgetPage: React.FC = () => {
  const { profile } = useAuth();

  if (!profile || profile.role !== 'company') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You need company privileges to access budget management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout title="Budget Management">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <CreditCard className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Budget Management</h1>
            <p className="text-muted-foreground">
              Manage your lead budget and track expenses
            </p>
          </div>
        </div>

        <BudgetManagement />
      </div>
    </DashboardLayout>
  );
};