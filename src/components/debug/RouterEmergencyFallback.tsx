import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';

export function RouterEmergencyFallback() {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Routing Issue Detected</h1>
          <p className="text-muted-foreground">
            The page couldn't load properly. This diagnostic fallback will help identify the issue.
          </p>
        </div>

        <div className="p-4 bg-muted rounded-lg text-left text-sm">
          <h3 className="font-semibold mb-2">Quick Status:</h3>
          <ul className="space-y-1">
            <li>Router Mode: {import.meta.env.VITE_ROUTER_MODE || 'browser (default)'}</li>
            <li>Hostname: {window.location.hostname}</li>
            <li>Path: {window.location.pathname}</li>
            <li>Auth: {user ? '✅ Authenticated' : '❌ Not authenticated'}</li>
            <li>Profile: {profile ? `✅ ${profile.role}` : '❌ No profile'}</li>
            <li>Is Lovable: {window.location.hostname.includes('lovableproject.com') ? '✅ Yes' : '❌ No'}</li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">Try these safe routes:</div>
          <div className="flex flex-col gap-2">
            <Link 
              to="/" 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              🏠 Home Page
            </Link>
            {user && (
              <Link 
                to="/dashboard" 
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              >
                📊 Dashboard
              </Link>
            )}
            {!user && (
              <Link 
                to="/login" 
                className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors"
              >
                🔐 Login
              </Link>
            )}
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          If this persists, check the browser console for detailed error messages.
        </div>
      </div>
    </div>
  );
}