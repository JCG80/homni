
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';

interface AuthenticatedProps {
  children: ReactNode;
}

export const Authenticated = ({ children }: AuthenticatedProps) => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return <div>Laster inn bruker...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!profile) {
    return (
      <div className="p-4 text-center">
        🚫 Fant ikke brukerprofil i databasen.<br />
        Vennligst kontakt administrator eller prøv å logge inn på nytt.
      </div>
    );
  }

  return <>{children}</>;
};
