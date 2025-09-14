
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { setupTestUsers } from '../utils/setupTestUsers';
import { Loader2 } from 'lucide-react';
import { logger } from '@/utils/logger';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isLoading } = useAuth();
  const [showLoading, setShowLoading] = useState(false);
  
  // Only show loading indicator after a short delay to prevent flash
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowLoading(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [isLoading]);

  // In development mode, make the setupTestUsers function available globally
  useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      // @ts-ignore
      window.setupTestUsers = setupTestUsers;
    }
  }, []);

  // EMERGENCY: Add timeout to prevent infinite loading - SINGLE AGGRESSIVE TIMEOUT
  useEffect(() => {
    console.log('[EMERGENCY AuthWrapper] Setting up loading timeout');
    const timeoutId = setTimeout(() => {
      console.log('[EMERGENCY AuthWrapper] Timeout reached, forcing app to render regardless of auth state');
      setShowLoading(false);
    }, 500); // EMERGENCY: Most aggressive - 500ms timeout
    
    return () => clearTimeout(timeoutId);
  }, []);

  if (isLoading && showLoading) {
    console.log('[EMERGENCY AuthWrapper] Showing loading spinner');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 border-4 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="mt-4">Laster inn autentisering...</p>
          <p className="text-sm text-gray-500 mt-2">Dette skal bare ta et øyeblikk...</p>
        </div>
      </div>
    );
  }

  console.log('[EMERGENCY AuthWrapper] Rendering children');
  return <>{children}</>;
};
