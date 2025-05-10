
import React from 'react';
import { LoginForm } from '@/modules/auth/components/LoginForm';
import { Link } from 'react-router-dom';
import { devLogin } from '@/modules/auth/utils/devLogin';
import { toast } from '@/hooks/use-toast';

export const LoginPage = () => {
  const handleDevLogin = async (role: 'user' | 'company' | 'admin' | 'master-admin') => {
    const result = await devLogin(role);
    if (result.error) {
      toast({
        title: 'Innlogging feilet',
        description: result.error.message,
        variant: 'destructive',
      });
    }
    // Suksess-meldinger håndteres allerede i devLogin
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <Link to="/" className="inline-block mb-6 text-2xl font-bold text-primary">Homni</Link>
          <h1 className="text-3xl font-bold">Logg inn</h1>
          <p className="text-muted-foreground mt-2">
            Velkommen tilbake til Homni
          </p>
        </div>
        
        <LoginForm redirectTo="/dashboard" />

        {import.meta.env.MODE === 'development' && (
          <div className="mt-8 text-center space-x-2">
            <button 
              onClick={() => handleDevLogin('user')} 
              className="px-3 py-1 bg-gray-200 rounded text-xs"
            >
              Login as User
            </button>
            <button 
              onClick={() => handleDevLogin('company')} 
              className="px-3 py-1 bg-gray-200 rounded text-xs"
            >
              Login as Company
            </button>
            <button 
              onClick={() => handleDevLogin('admin')} 
              className="px-3 py-1 bg-gray-200 rounded text-xs"
            >
              Login as Admin
            </button>
            <button 
              onClick={() => handleDevLogin('master-admin')} 
              className="px-3 py-1 bg-gray-200 rounded text-xs"
            >
              Login as Master Admin
            </button>
          </div>
        )}
        
        <div className="text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            ← Tilbake til forsiden
          </Link>
        </div>
      </div>
    </div>
  );
};
