import React, { useEffect, useState } from 'react';
import { setupTestUsers } from '@/modules/auth/utils/setupTestUsers';
import { Loader2 } from 'lucide-react';
import { useAuthSession } from '@/modules/auth/hooks/useAuthSession';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [forceRender, setForceRender] = useState(false);
  const { isLoading } = useAuthSession();
  
  // In development mode, make the setupTestUsers function available globally
  useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      // @ts-ignore
      window.setupTestUsers = setupTestUsers;
    }
  }, []);

  // Enhanced timeout with auth state integration
  useEffect(() => {
    console.log('[AuthWrapper] Enhanced loading control - auth loading:', isLoading);
    
    // If auth is not loading, render immediately
    if (!isLoading) {
      setForceRender(true);
      return;
    }
    
    // Set emergency timeout for auth loading states
    const forceTimeout = setTimeout(() => {
      console.log('[AuthWrapper] Emergency timeout reached (3000ms) - rendering children');
      setForceRender(true);
    }, 3000); // Increased from 500ms to 3000ms for better stability
    
    return () => clearTimeout(forceTimeout);
  }, [isLoading]);

  // Show loading if auth is loading and force render hasn't triggered
  if (!forceRender && isLoading) {
    console.log('[AuthWrapper] Showing loading (auth state loading)');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4">Starter app...</p>
          <p className="text-sm text-muted-foreground mt-2">Autentisering...</p>
        </div>
      </div>
    );
  }

  console.log('[AuthWrapper] Rendering children - auth resolved');
  return <>{children}</>;
};