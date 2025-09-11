import { AnalyticsProvider } from '@/lib/analytics/react';
import { AuthProvider } from '@/modules/auth/hooks/useAuth';
import { ProfileContextProvider } from '@/contexts/ProfileContextProvider';
import { RoleProvider } from '@/contexts/RoleContext';
import { RolePreviewProvider } from '@/contexts/RolePreviewContext';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';
import { useAuth } from '@/modules/auth/hooks';

const queryClient = new QueryClient();

// AuthContent component that uses auth context - placed INSIDE AuthProvider
const AuthContent = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isMasterAdmin } = useAuth();
  const canUsePreview = isAdmin || isMasterAdmin;

  return (
    <RoleProvider>
      <RolePreviewProvider canUsePreview={canUsePreview}>
        <ProfileContextProvider>
          {children}
        </ProfileContextProvider>
      </RolePreviewProvider>
    </RoleProvider>
  );
};

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AccessibilityProvider>
      <ThemeProvider
        defaultTheme="system"
        storageKey="vite-react-tailwind-theme"
      >
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AnalyticsProvider>
              <AuthContent>
                {children}
              </AuthContent>
            </AnalyticsProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AccessibilityProvider>
  );
}