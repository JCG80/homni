
import React from 'react';

export const PropertyLoadingState: React.FC = () => {
  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
      <div className="animate-pulse space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col space-y-3">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        {/* Main content skeleton */}
        <div className="h-64 bg-gray-200 rounded"></div>
        
        {/* Tab skeleton */}
        <div className="flex space-x-4 mt-6 border-b">
          <div className="h-10 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>
        
        {/* Tab content skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};
