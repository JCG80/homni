
import React from 'react';
import { AppRoutes } from './Routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { Toaster } from '@/components/ui/toaster';
import './App.css';
import { AuthProvider } from '@/modules/auth/hooks/useAuth';
import { RoleProvider } from '@/modules/auth/providers/RoleProvider';
import { AuthWrapper } from './modules/auth/components/AuthWrapper';
import { I18nProvider } from './lib/i18n/I18nProvider';

// Create clients
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const supabaseClient = createClient(
  'https://kkazhcihooovsuwravhs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXpoY2lob29vdnN1d3JhdmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzMwMzUsImV4cCI6MjA2MjEwOTAzNX0.-HzjqXYqgThN0PrbrwZlm5GWK1vOGOeYHEEFrt0OpwM'
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider supabaseClient={supabaseClient}>
        <I18nProvider>
          <AuthProvider>
            <RoleProvider>
              <AuthWrapper>
                <AppRoutes />
                <Toaster />
              </AuthWrapper>
            </RoleProvider>
          </AuthProvider>
        </I18nProvider>
      </SessionContextProvider>
    </QueryClientProvider>
  );
}

export default App;
