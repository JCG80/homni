import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SiteLayout } from '@/components/layout/SiteLayout';
import { AuthProvider } from '@/modules/auth/hooks/useAuth';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Shell } from '@/components/layout/Shell';

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider
      defaultTheme="system"
      storageKey="vite-react-tailwind-theme"
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SiteLayout>
            <Shell />
          </SiteLayout>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
