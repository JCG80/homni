
import React from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <p className="text-lg">Velkommen til Homni dashbordet!</p>
        {user && (
          <p className="mt-2">Logget inn som: {user.email}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/my-account">
          <Button variant="outline" size="lg" className="w-full hover:shadow-md transition-shadow">
            <User className="mr-2 h-4 w-4 text-blue-600" /> 
            Min side
          </Button>
        </Link>
        {/* Keep existing buttons or add more as needed */}
      </div>
    </div>
  );
};
