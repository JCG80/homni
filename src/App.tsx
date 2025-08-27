import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ApiAdminPage from '@/pages/admin/ApiAdminPage';
import { SiteLayout } from '@/components/layout/SiteLayout';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { RoleSwitch } from '@/components/RoleSwitch';
import { ActiveRoleProvider } from '@/providers/ActiveRoleProvider';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useIsMasterAdmin } from '@/hooks/useIsMasterAdmin';
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
          <ActiveRoleProvider>
            <SiteLayout>
              <RoleSwitch />
              <BrowserRouter>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <RequireAuth>
                        <Shell />
                      </RequireAuth>
                    }
                  />
                  <Route path="/admin/api" element={<ApiAdminPage />} />
                </Routes>
              </BrowserRouter>
            </SiteLayout>
            <Toaster />
          </ActiveRoleProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
