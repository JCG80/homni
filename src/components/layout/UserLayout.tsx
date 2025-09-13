import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/modules/auth/hooks';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export const UserLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <SidebarProvider collapsedWidth={56}>
      <div className="min-h-screen flex w-full bg-background">
        {isAuthenticated && <AppSidebar />}
        
        <SidebarInset className="flex-1">
          <Header />
          
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};