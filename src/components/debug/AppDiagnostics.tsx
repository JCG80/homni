import React, { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useCurrentRole } from '@/hooks/useCurrentRole';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

export function AppDiagnostics() {
  const { user, profile, isLoading } = useAuth();
  const flags = useFeatureFlags();
  const role = useCurrentRole();
  const location = useLocation();
  
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem('debug-app-visible') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('debug-app-visible', String(isVisible));
  }, [isVisible]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'debug-app-visible') {
        setIsVisible(e.newValue !== 'false');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!import.meta.env.DEV || !isVisible) return null;

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
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">🔍 App Diagnostics</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-muted rounded transition-colors"
          aria-label="Close diagnostics"
        >
          <X size={12} />
        </button>
      </div>
      
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