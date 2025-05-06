
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { LoginForm } from '@/modules/auth/components/LoginForm';

export const Unauthenticated = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Laster inn...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Logg inn</h1>
      <div className="max-w-md mx-auto">
        <LoginForm />
      </div>
    </div>
  );
};
