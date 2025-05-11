
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { LoginForm } from '@/modules/auth/components/LoginForm';

export const Unauthenticated = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
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
      <h1 className="text-3xl font-bold mb-8 text-center">Logg inn</h1>
      <div className="max-w-md mx-auto bg-card p-8 rounded-lg shadow-lg">
        <LoginForm />
      </div>
    </div>
  );
};
