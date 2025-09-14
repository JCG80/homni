
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

  // EMERGENCY: Force render after 300ms - no dependency on auth state
  useEffect(() => {
    console.log('[EMERGENCY AuthWrapper] Setting 300ms force render timeout');
    const forceTimeout = setTimeout(() => {
      console.log('[EMERGENCY AuthWrapper] Force timeout reached - rendering children');
      setForceRender(true);
    }, 300);
    
    return () => clearTimeout(forceTimeout);
  }, []);

  // Show loading for maximum 300ms, then force render
  if (!forceRender) {
    console.log('[EMERGENCY AuthWrapper] Showing brief loading (max 300ms)');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 border-4 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="mt-4">Starter app...</p>
          <p className="text-sm text-gray-500 mt-2">Maksimalt 300ms...</p>
        </div>
      </div>
    );
  }

  console.log('[EMERGENCY AuthWrapper] Rendering children');
  return <>{children}</>;
};
