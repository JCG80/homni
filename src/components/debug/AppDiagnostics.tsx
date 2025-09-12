import React from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useCurrentRole } from '@/hooks/useCurrentRole';
import { useLocation } from 'react-router-dom';

export function AppDiagnostics() {
  const { user, profile, isLoading } = useAuth();
  const flags = useFeatureFlags();
  const role = useCurrentRole();
  const location = useLocation();

  if (!import.meta.env.DEV) return null;

  const diagnostics = {
    environment: {
      routerMode: import.meta.env.VITE_ROUTER_MODE || 'browser',
      hostname: window.location.hostname,
      isLovableHost: window.location.hostname.includes('lovableproject.com'),
      baseUrl: import.meta.env.BASE_URL || '/',
      pathname: location.pathname,
      search: location.search,
    },
    auth: {
      isLoading,
      hasUser: !!user,
      hasProfile: !!profile,
      userId: user?.id,
      userEmail: user?.email,
      profileRole: profile?.role,
      currentRole: role,
    },
    featureFlags: Object.entries(flags)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name),
    routing: {
      currentPath: location.pathname,
      hasLovableToken: new URLSearchParams(location.search).has('__lovable_token'),
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md p-4 bg-background border rounded-lg shadow-lg text-xs font-mono">
      <h3 className="font-bold text-sm mb-2">🔍 App Diagnostics</h3>
      
      <div className="space-y-2">
        <details>
          <summary className="cursor-pointer font-semibold">Environment</summary>
          <pre className="mt-1 text-xs">{JSON.stringify(diagnostics.environment, null, 2)}</pre>
        </details>
        
        <details>
          <summary className="cursor-pointer font-semibold">Auth State</summary>
          <pre className="mt-1 text-xs">{JSON.stringify(diagnostics.auth, null, 2)}</pre>
        </details>
        
        <details>
          <summary className="cursor-pointer font-semibold">Feature Flags ({diagnostics.featureFlags.length})</summary>
          <pre className="mt-1 text-xs">{JSON.stringify(diagnostics.featureFlags, null, 2)}</pre>
        </details>
        
        <details>
          <summary className="cursor-pointer font-semibold">Routing</summary>
          <pre className="mt-1 text-xs">{JSON.stringify(diagnostics.routing, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
}