import React from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/modules/auth/hooks/useAuth';
import { AuthWrapper } from '@/modules/auth/components/AuthWrapper';
import { AppRoutes } from '@/Routes';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { supabase } from '@/lib/supabaseClient';
import { RoleProvider } from '@/contexts/RoleContext';
import { AppLayout } from '@/components/layout/AppLayout';

// Create a stable QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

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
                  <AppLayout className="min-h-screen bg-background text-foreground">
                    <AppRoutes />
                    <Toaster />
                  </AppLayout>
                </AuthWrapper>
              </RoleProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SessionContextProvider>
    </ErrorBoundary>
  );
}