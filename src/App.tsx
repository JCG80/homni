
import './App.css'
import AppRoutes from './Routes'
import { Toaster } from './components/ui/toaster'
import { AuthProvider } from './modules/auth/hooks/useAuth'
import { QuickLogin } from './modules/auth/components/QuickLogin'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
          <Toaster />
          <QuickLogin />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
