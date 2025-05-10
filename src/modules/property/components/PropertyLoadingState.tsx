
import React from 'react';

export const PropertyLoadingState: React.FC = () => {
  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="h-64 bg-gray-200 rounded mb-6"></div>
      </div>
    </div>
  );
};
