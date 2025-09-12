import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useCurrentRole } from '@/hooks/useCurrentRole';

export function RouterDiagnostics() {
  const location = useLocation();
  const navigate = useNavigate();
  const flags = useFeatureFlags();
  const role = useCurrentRole();

  if (!import.meta.env.DEV) return null;

  const routerInfo = {
    mode: import.meta.env.VITE_ROUTER_MODE || 'browser',
    isLovableHost: window.location.hostname.includes('lovableproject.com'),
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    baseUrl: import.meta.env.BASE_URL || '/',
    role,
    enabledFlags: Object.entries(flags).filter(([_, v]) => v).map(([k]) => k)
  };

  const quickNavigation = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/login', label: 'Login' },
    { path: '/admin', label: 'Admin' }
  ];

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md p-4 bg-background border rounded-lg shadow-lg text-xs font-mono">
      <h3 className="font-bold text-sm mb-2">🧭 Router Debug</h3>
      
      <div className="space-y-2">
        <div>
          <strong>Mode:</strong> {routerInfo.mode} 
          {routerInfo.isLovableHost && ' (Lovable)'}
        </div>
        
        <div>
          <strong>Path:</strong> {routerInfo.pathname}
        </div>
        
        <div>
          <strong>Role:</strong> {routerInfo.role}
        </div>

        {routerInfo.enabledFlags.length > 0 && (
          <div>
            <strong>Flags:</strong> {routerInfo.enabledFlags.join(', ')}
          </div>
        )}

        <details className="mt-2">
          <summary className="cursor-pointer font-semibold">Quick Nav</summary>
          <div className="mt-1 space-y-1">
            {quickNavigation.map(nav => (
              <button
                key={nav.path}
                onClick={() => navigate(nav.path)}
                className="block w-full text-left px-2 py-1 text-xs bg-muted hover:bg-accent rounded transition-colors"
                disabled={location.pathname === nav.path}
              >
                {nav.label} {location.pathname === nav.path && '(current)'}
              </button>
            ))}
          </div>
        </details>

        <details>
          <summary className="cursor-pointer font-semibold">Full State</summary>
          <pre className="mt-1 text-xs overflow-auto max-h-32">
            {JSON.stringify(routerInfo, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}