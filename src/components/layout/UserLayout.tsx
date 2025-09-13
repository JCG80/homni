import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { AppSidebar } from './AppSidebar';
import { SimplifiedModeSwitcher } from '@/components/auth/SimplifiedModeSwitcher';
import { useAuth } from '@/modules/auth/hooks';
import { useRoleContext } from '@/contexts/RoleContext';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

export const UserLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { roles } = useRoleContext();

  // Check if user can switch between personal/professional modes
  const showModeSwitcher = isAuthenticated && 
    (roles.includes('company') || roles.includes('buyer'));

  return (
    <SidebarProvider collapsedWidth={56}>
      <div className="min-h-screen flex w-full bg-background">
        {isAuthenticated && <AppSidebar />}
        
        <SidebarInset className="flex-1">
          <Header />
          
          {/* Mode switcher for users with both personal/professional access */}
          {showModeSwitcher && (
            <div className="border-b bg-muted/20 px-6 py-3">
              <SimplifiedModeSwitcher />
            </div>
          )}
          
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