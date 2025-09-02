import React from 'react';
import { DIYSalesDashboard } from '@/components/sales/DIYSalesDashboard';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export function DIYSalesPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DIYSalesDashboard />
    </div>
  );
}