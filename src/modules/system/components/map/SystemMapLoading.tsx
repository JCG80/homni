
import React from 'react';

export const SystemMapLoading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-lg">Laster systemkart...</p>
      </div>
    </div>
  );
};
