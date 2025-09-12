import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { LayoutSidebar } from './LayoutSidebar';
import { SimplifiedModeSwitcher } from '@/components/auth/SimplifiedModeSwitcher';
import { useAuth } from '@/modules/auth/hooks';
import { useRoleContext } from '@/contexts/RoleContext';

export const UserLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { roles } = useRoleContext();

  // Check if user can switch between personal/professional modes
  const showModeSwitcher = isAuthenticated && 
    (roles.includes('company') || roles.includes('buyer'));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <div className="hidden md:block w-64">
          <LayoutSidebar />
        </div>
        
        <div className="flex-1">
          {/* Mode switcher for users with both personal/professional access */}
          {showModeSwitcher && (
            <div className="border-b bg-muted/20 px-6 py-3">
              <SimplifiedModeSwitcher />
            </div>
          )}
          
          <main className="p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};