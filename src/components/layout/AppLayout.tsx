import React from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { useIsMobile } from '@/hooks/use-mobile';
import { QuickAccessFAB } from './QuickAccessFAB';
import { PWAInstallBanner } from '@/components/pwa/PWAInstallBanner';
import { ContextualNavigationPanel } from '@/components/navigation/ContextualNavigationPanel';

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
      
      {/* Contextual Navigation for Desktop */}
      {isAuthenticated && !isMobile && (
        <div className="fixed top-20 right-4 z-40 w-64">
          <ContextualNavigationPanel variant="popup" />
        </div>
      )}
      
      {/* Quick Access FAB for mobile authenticated users */}
      {isAuthenticated && isMobile && (
        <QuickAccessFAB />
      )}
      
      {/* PWA Install Banner */}
      <PWAInstallBanner />
    </div>
  );
}