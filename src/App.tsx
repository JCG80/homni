
import './App.css'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from './components/ui/toaster'
import { AuthWrapper } from './modules/auth/components/AuthWrapper'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Suspense, lazy } from 'react'
import { LandingPage } from './pages/LandingPage'
import { Dashboard } from './pages/Dashboard'
import MyAccountPage from './pages/MyAccountPage'
import { LeadCapturePage } from './modules/leads/pages/LeadCapturePage'
import { LeadManagementPage } from './modules/leads/pages/LeadManagementPage'
import { ProfilePage } from './modules/auth/pages/ProfilePage'
import { CompanyProfilePage } from './modules/company/pages/CompanyProfilePage'
import { AdminLeadsPage } from './modules/leads/pages/AdminLeadsPage'
import { LeadSettingsPage } from './modules/leads/pages/LeadSettingsPage'
import { UnauthorizedPage } from './pages/UnauthorizedPage'
import { InsuranceRequestSuccessPage } from './pages/InsuranceRequestSuccessPage'
import { ProtectedRoute } from './modules/auth/components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './modules/auth/pages/RegisterPage'

// Import module-specific routes
import { docsRoutes } from './modules/docs/routes'

// Create a client with retry logic
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3, // Retry failed queries up to 3 times
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      retry: 2, // Retry failed mutations up to 2 times
    },
  },
})

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthWrapper>
          <div className="App">
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route 
                  path="/my-account" 
                  element={
                    <ProtectedRoute allowAnyAuthenticated>
                      <MyAccountPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/lead-capture" element={<LeadCapturePage />} />
                <Route path="/leads" element={<LeadManagementPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/company/profile" element={<CompanyProfilePage />} />
                <Route path="/admin/leads" element={<AdminLeadsPage />} />
                <Route path="/admin/settings" element={<LeadSettingsPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/insurance-request-success" element={<InsuranceRequestSuccessPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Include module routes */}
                {docsRoutes}
              </Routes>
            </Suspense>
            <Toaster />
          </div>
        </AuthWrapper>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
