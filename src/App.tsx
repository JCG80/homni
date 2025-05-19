
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppRoutes } from './Routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import './App.css';
import { AuthWrapper } from './modules/auth/components/AuthWrapper';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthWrapper>
        <Router>
          <AppRoutes />
          <Toaster />
        </Router>
      </AuthWrapper>
    </QueryClientProvider>
  );
}

export default App;
