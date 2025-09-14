import { AnalyticsProvider } from '@/lib/analytics/react';
import { AuthProvider } from '@/modules/auth/hooks/useAuth';
import { ProfileContextProvider } from '@/contexts/ProfileContextProvider';
import { RoleProvider } from '@/contexts/RoleContext';
import { RolePreviewProvider } from '@/contexts/RolePreviewContext';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';

const queryClient = new QueryClient();

// FIXED: Separate wrapper that doesn't create circular dependency
const AuthDependentWrapper = ({ children }: { children: React.ReactNode }) => {
  console.log('[EMERGENCY AuthDependentWrapper] Rendering without circular dependency');
  
  return (
    <RoleProvider>
      <RolePreviewProvider canUsePreview={false}>
        <ProfileContextProvider>
          {children}
        </ProfileContextProvider>
      </RolePreviewProvider>
    </RoleProvider>
  );
};

export function AppProviders({ children }: { children: React.ReactNode }) {
  console.log('[EMERGENCY AppProviders] Starting provider initialization');
  
  return (
    <AccessibilityProvider>
      <ThemeProvider
        defaultTheme="system"
        storageKey="vite-react-tailwind-theme"
      >
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AnalyticsProvider>
              <AuthDependentWrapper>
                {children}
              </AuthDependentWrapper>
            </AnalyticsProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AccessibilityProvider>
  );
}