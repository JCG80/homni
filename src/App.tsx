import React from 'react';
import './index.css';
import '@/styles/accessibility.css';
import { Routes, Route } from 'react-router-dom';
import { SiteLayout } from '@/components/layout/SiteLayout';
import { AuthProvider } from '@/modules/auth/hooks/useAuth';
import { ProfileContextProvider } from './contexts/ProfileContextProvider';
import { RoleProvider } from '@/contexts/RoleContext';
import { RolePreviewProvider } from '@/contexts/RolePreviewContext';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Shell } from '@/components/layout/Shell';
import { useAuth } from '@/modules/auth/hooks';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ConnectionStatus } from '@/components/loading/UniversalLoadingStates';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';
import { RouterDebugInfo } from '@/components/debug/RouterDebugInfo';

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAdmin, isMasterAdmin } = useAuth();
  const canUsePreview = isAdmin || isMasterAdmin;

  return (
    <ErrorBoundary>
      <ConnectionStatus />
      <RoleProvider>
        <RolePreviewProvider canUsePreview={canUsePreview}>
          <ProfileContextProvider>
            <SiteLayout>
              <Shell />
              <RouterDebugInfo />
              <Toaster />
            </SiteLayout>
          </ProfileContextProvider>
        </RolePreviewProvider>
      </RoleProvider>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <AccessibilityProvider>
      <ThemeProvider
        defaultTheme="system"
        storageKey="vite-react-tailwind-theme"
      >
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AccessibilityProvider>
  );
}

export default App;