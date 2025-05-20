
import React, { Suspense } from 'react';
import { AppRouteComponents } from './routes';

/**
 * Main application routes component with loading state
 */
export const AppRoutes = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Laster inn...</p>
        </div>
      </div>
    }>
      <AppRouteComponents />
    </Suspense>
  );
};
