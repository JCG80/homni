
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';

interface AuthenticatedProps {
  children: ReactNode;
}

export const Authenticated = ({ children }: AuthenticatedProps) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Laster inn bruker...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Pass the current location so we can redirect back after login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  if (!profile) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto mt-16">
        <div className="text-5xl mb-4">🚫</div>
        <h2 className="text-xl font-bold text-red-700 mb-4">Fant ikke brukerprofil</h2>
        <p className="mb-6 text-gray-700">
          Din brukerkonto mangler en tilknyttet profil i databasen.
        </p>
        <p className="text-sm text-gray-600">
          Vennligst kontakt administrator eller prøv å logge inn på nytt.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
