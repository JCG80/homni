import React from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/modules/auth/hooks';
import { AuthWrapper } from '@/modules/auth/components/AuthWrapper';
import { AppRoutes } from '@/Routes';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { supabase } from '@/lib/supabaseClient';
import { RoleProvider } from '@/contexts/RoleContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { initializePlugins } from '@/core/plugins/pluginLoader';
import { initializeModules } from '@/core/modules/moduleRegistry';

// Create a stable QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize plugins and modules on app start
Promise.all([
  initializePlugins(),
  initializeModules()
]).catch(console.error);

export default function App() {
  return (
    <ErrorBoundary>
      <SessionContextProvider supabaseClient={supabase}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="system" 
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <RoleProvider>
                <AuthWrapper>
                  <div className="min-h-screen bg-background text-foreground">
                    <AppLayout />
                    <Toaster />
                  </div>
                </AuthWrapper>
              </RoleProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SessionContextProvider>
    </ErrorBoundary>
  );
}