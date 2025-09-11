import React from 'react';
import { useLocation } from 'react-router-dom';

export const RouterDebugInfo: React.FC = () => {
  const location = useLocation();
  
  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  const routerMode = import.meta.env.VITE_ROUTER_MODE || 'browser';
  
  return (
    <div className="fixed bottom-4 right-4 bg-background/90 backdrop-blur-sm border rounded-lg p-3 text-xs font-mono z-50 max-w-xs">
      <div className="text-muted-foreground mb-2">🔧 Router Debug</div>
      <div className="space-y-1">
        <div>
          <span className="text-muted-foreground">Mode:</span>{' '}
          <span className={routerMode === 'hash' ? 'text-orange-500' : 'text-green-500'}>
            {routerMode}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Path:</span>{' '}
          <span className="text-foreground">{location.pathname}</span>
        </div>
        {location.search && (
          <div>
            <span className="text-muted-foreground">Query:</span>{' '}
            <span className="text-foreground">{location.search}</span>
          </div>
        )}
        {location.hash && (
          <div>
            <span className="text-muted-foreground">Hash:</span>{' '}
            <span className="text-foreground">{location.hash}</span>
          </div>
        )}
      </div>
    </div>
  );
};