
import React, { ReactNode } from 'react';
import { useAuth } from '@/modules/auth/hooks';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { role, profile } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{title || `${profile?.full_name || 'User'}'s Dashboard`}</h1>
      <p className="text-muted-foreground mb-6">
        {role === 'user' ? 'Bruker Dashboard' : 
         role === 'company' ? 'Firmaportal' : 
         role === 'admin' ? 'Administrator Panel' : 
         role === 'master_admin' ? 'Master Administrator Panel' :
         role === 'content_editor' ? 'Content Management System' :
         'Dashboard'}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );
};
