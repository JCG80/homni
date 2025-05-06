
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./modules/auth/hooks/useAuth";
import { LoginPage } from "./modules/auth/pages/LoginPage";
import { RegisterPage } from "./modules/auth/pages/RegisterPage";
import { UnauthorizedPage } from "./modules/auth/pages/UnauthorizedPage";
import { ProtectedRoute } from "./modules/auth/components/ProtectedRoute";

// Import the lead pages
import { UserLeadsPage } from "./modules/leads/pages/UserLeadsPage";
import { AdminLeadsPage } from "./modules/leads/pages/AdminLeadsPage";
import { CompanyLeadsPage } from "./modules/leads/pages/CompanyLeadsPage";
import { LeadDetailsPage } from "./modules/leads/pages/LeadDetailsPage";
import { LeadTestPage } from "./modules/leads/pages/LeadTestPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Protected routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute allowedRoles={['user', 'company', 'admin', 'master-admin']}>
                  <Index />
                </ProtectedRoute>
              } 
            />
            
            {/* Leads routes */}
            <Route 
              path="/leads" 
              element={
                <ProtectedRoute allowedRoles={['user', 'company', 'admin', 'master-admin']}>
                  <UserLeadsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/leads/:leadId" 
              element={
                <ProtectedRoute allowedRoles={['user', 'company', 'admin', 'master-admin']}>
                  <LeadDetailsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/leads" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'master-admin']}>
                  <AdminLeadsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/company/leads" 
              element={
                <ProtectedRoute allowedRoles={['company']}>
                  <CompanyLeadsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Test routes */}
            <Route
              path="/lead-tests"
              element={
                <ProtectedRoute allowedRoles={['user', 'company', 'admin', 'master-admin']}>
                  <LeadTestPage />
                </ProtectedRoute>
              }
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
