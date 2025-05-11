
import React from 'react';

interface SystemMapErrorProps {
  error: string;
}

export const SystemMapError = ({ error }: SystemMapErrorProps) => {
  return (
    <div className="container mx-auto p-6">
      <div className="bg-red-50 border border-red-200 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    </div>
  );
};
