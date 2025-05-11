
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { LoginTabs } from '@/components/auth/LoginTabs';
import { TestUserManager } from '@/components/auth/TestUserManager';
import { UserRole } from '@/modules/auth/utils/roles';
import { devLogin } from '@/modules/auth/utils/devLogin';
import { toast } from '@/hooks/use-toast';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Handle test user login
  const handleDevLogin = async (role: UserRole) => {
    const result = await devLogin(role);
    if (result.error) {
      toast({
        title: 'Login failed',
        description: result.error.message,
        variant: 'destructive',
      });
    }
    // Success notifications are already handled in devLogin
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Laster inn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <Link to="/" className="inline-block mb-6 text-2xl font-bold text-primary">Homni</Link>
          
          <LoginTabs />
        </div>
        
        {import.meta.env.MODE === 'development' && (
          <TestUserManager onLoginClick={handleDevLogin} />
        )}
        
        <div className="text-center text-sm">
          <p className="text-muted-foreground mb-2">
            Har du ikke konto?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Registrer deg
            </Link>
          </p>
          <Link to="/" className="hover:text-primary text-muted-foreground">
            ← Tilbake til forsiden
          </Link>
        </div>
      </div>
    </div>
  );
};
