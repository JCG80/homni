
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { LoginForm } from '@/modules/auth/components/LoginForm';
import { ShieldCheck } from 'lucide-react';

export const Unauthenticated = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Laster inn...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center mb-4">
          <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold ml-3">Homni</h1>
        </div>
        <p className="text-muted-foreground">Du må logge inn for å få tilgang til denne siden</p>
      </div>
      
      <div className="max-w-md mx-auto bg-card p-8 rounded-lg shadow-lg">
        <LoginForm />
      </div>
    </div>
  );
};
