import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useCurrentRole } from '@/hooks/useCurrentRole';
import { getHostEnvironment, isLovablePreviewHost } from '@/lib/env/hosts';
import { X } from 'lucide-react';

export function RouterDiagnostics() {
  const location = useLocation();
  const navigate = useNavigate();
  const flags = useFeatureFlags();
  const role = useCurrentRole();
  const hostEnv = getHostEnvironment();
  
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem('debug-router-visible') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('debug-router-visible', String(isVisible));
  }, [isVisible]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'debug-router-visible') {
        setIsVisible(e.newValue !== 'false');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Show in dev or preview mode for easy debugging
  if ((!import.meta.env.DEV && hostEnv !== 'preview') || !isVisible) return null;

  const routerInfo = {
    mode: import.meta.env.VITE_ROUTER_MODE || 'browser',
    isLovableHost: isLovablePreviewHost(),
    hostEnv,
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
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">🧭 Router Debug</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-muted rounded transition-colors"
          aria-label="Close router diagnostics"
        >
          <X size={12} />
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong>Mode:</strong> {routerInfo.mode} ({routerInfo.hostEnv})
          {routerInfo.isLovableHost && ' 🔧'}
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