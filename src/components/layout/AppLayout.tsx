import React from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { useIsMobile } from '@/hooks/use-mobile';
import { QuickAccessFAB } from './QuickAccessFAB';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className={className}>
      {children}
      
      {/* Quick Access FAB for mobile authenticated users */}
      {isAuthenticated && isMobile && (
        <QuickAccessFAB />
      )}
    </div>
  );
}