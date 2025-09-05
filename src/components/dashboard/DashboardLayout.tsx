
import React, { ReactNode } from 'react';
import { useAuth } from '@/modules/auth/hooks';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { role, profile } = useAuth();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="text-muted-foreground">
          {role === 'user' ? 'Bruker Dashboard' : 
           role === 'company' ? 'Firmaportal' : 
           role === 'admin' ? 'Administrator Panel' : 
           role === 'master_admin' ? 'Master Administrator Panel' :
           role === 'content_editor' ? 'Content Management System' :
           'Dashboard'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );
};
