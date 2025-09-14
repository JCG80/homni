
import React, { useEffect, useState } from 'react';
import { setupTestUsers } from '../utils/setupTestUsers';
import { Loader2 } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [forceRender, setForceRender] = useState(false);
  
  // In development mode, make the setupTestUsers function available globally
  useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      // @ts-ignore
      window.setupTestUsers = setupTestUsers;
    }
  }, []);

  // SIMPLIFIED: Force render after 500ms - no auth dependencies  
  useEffect(() => {
    console.log('[AuthWrapper] Setting 500ms force render timeout');
    const forceTimeout = setTimeout(() => {
      console.log('[AuthWrapper] Force timeout reached - rendering children');
      setForceRender(true);
    }, 500);
    
    return () => clearTimeout(forceTimeout);
  }, []);

  // Show loading for maximum 500ms, then force render
  if (!forceRender) {
    console.log('[AuthWrapper] Showing brief loading (max 500ms)');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4">Starter app...</p>
          <p className="text-sm text-muted-foreground mt-2">Maksimalt 500ms...</p>
        </div>
      </div>
    );
  }

  console.log('[AuthWrapper] Rendering children');
  return <>{children}</>;
};
