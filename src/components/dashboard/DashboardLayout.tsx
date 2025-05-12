
import React, { ReactNode } from 'react';
import { useAuth } from '@/modules/auth/hooks';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { role, module_access } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{title || 'Dashboard'}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );
};
