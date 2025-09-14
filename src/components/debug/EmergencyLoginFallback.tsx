import React from 'react';
import { LoginForm } from '@/modules/auth/components/LoginForm';
import { DevSeedUsers } from '@/modules/auth/components/DevSeedUsers';

/**
 * Emergency login fallback component
 * Always renders login functionality regardless of routing issues
 */
export const EmergencyLoginFallback = () => {
  console.log('[EMERGENCY LOGIN FALLBACK] Rendering emergency login');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">!</span>
          </div>
          <h1 className="text-3xl font-bold text-red-600">Emergency Login</h1>
          <p className="text-muted-foreground mt-2">
            Normal routing failed. Using emergency fallback.
          </p>
        </div>
        <LoginForm userType="private" />
        <div className="mt-4">
          <DevSeedUsers />
        </div>
        <div className="mt-4 text-xs text-muted-foreground text-center">
          <p>Emergency Mode Active</p>
          <p>Check console for debugging info</p>
        </div>
      </div>
    </div>
  );
};