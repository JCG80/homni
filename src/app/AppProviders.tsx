import { AnalyticsProvider } from '@/lib/analytics/react';
import { ProfileContextProvider } from '@/contexts/ProfileContextProvider';
import { RoleProvider } from '@/contexts/RoleContext';
import { RolePreviewProvider } from '@/contexts/RolePreviewContext';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';
import { PluginSystemProvider } from '@/lib/core/PluginSystemProvider';
import { LocalizationProvider } from '@/lib/localization/LocalizationProvider';
import { FeatureFlagProvider } from '@/lib/feature-flags/FeatureFlagProvider';

const queryClient = new QueryClient();

const AuthDependentWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <PluginSystemProvider>
      <LocalizationProvider defaultLocale="no">
        <FeatureFlagProvider>
          <RoleProvider>
            <RolePreviewProvider canUsePreview={false}>
              <ProfileContextProvider>
                {children}
              </ProfileContextProvider>
            </RolePreviewProvider>
          </RoleProvider>
        </FeatureFlagProvider>
      </LocalizationProvider>
    </PluginSystemProvider>
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
          <AnalyticsProvider>
            <AuthDependentWrapper>
              {children}
            </AuthDependentWrapper>
          </AnalyticsProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AccessibilityProvider>
  );
}