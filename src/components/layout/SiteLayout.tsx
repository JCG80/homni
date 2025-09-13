import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { NavigationSync } from '@/components/navigation/NavigationSync';
import { UserEngagementTracker } from '@/components/navigation/UserEngagementTracker';

interface SiteLayoutProps {
  children: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  const location = useLocation();
  
  // Don't render Header for admin routes - AdminLayout handles its own header
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    // For admin routes, just render children (AdminLayout will handle header/sidebar)
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }
  
  // For user routes, use the standard layout with Header
  return (
    <UserEngagementTracker>
      <div className="min-h-screen bg-background">
        <Header />
        <NavigationSync />
        {children}
      </div>
    </UserEngagementTracker>
  );
}