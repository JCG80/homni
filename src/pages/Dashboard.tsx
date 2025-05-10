
import React from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-lg">Velkommen til Homni dashbordet!</p>
        {user && (
          <p className="mt-2">Logget inn som: {user.email}</p>
        )}
      </div>
    </div>
  );
};
