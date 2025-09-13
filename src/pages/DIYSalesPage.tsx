import React from 'react';
import { DIYSalesDashboard } from '@/components/sales/DIYSalesDashboard';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';

export function DIYSalesPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <PageLayout 
      title="DIY Salg"
      description="Selg boligen din uten megler"
      showBreadcrumbs={true}
    >
      <DIYSalesDashboard />
    </PageLayout>
  );
}