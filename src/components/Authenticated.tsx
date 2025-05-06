
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';

interface AuthenticatedProps {
  children: ReactNode;
}

export const Authenticated = ({ children }: AuthenticatedProps) => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p>Laster inn bruker...</p>
      </div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!profile) {
    return (
      <div className="p-6 text-center bg-red-50 border border-red-200 rounded-md max-w-md mx-auto mt-8">
        <div className="text-4xl mb-2">🚫</div>
        <h2 className="text-lg font-semibold text-red-700 mb-2">Fant ikke brukerprofil</h2>
        <p className="mb-4 text-gray-700">
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
