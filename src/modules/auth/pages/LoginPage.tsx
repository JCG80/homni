import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { LoginForm } from '@/modules/auth/components/LoginForm';
import { DevSeedUsers } from '@/modules/auth/components/DevSeedUsers';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { routeForRole } from '@/config/routeForRole';
import { UserRole } from '@/modules/auth/normalizeRole';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, role, isLoading } = useAuth();
  const userType = searchParams.get('type') === 'business' ? 'business' : 'private';
  const returnUrl = searchParams.get('returnUrl');

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && role && !isLoading) {
      const redirectTo = returnUrl || routeForRole(role as UserRole);
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, role, isLoading, returnUrl, navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Sjekker innlogging...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if user is already authenticated (will redirect)
  if (isAuthenticated && role) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md p-6">
          <Helmet>
            <title>Logg inn – Homni</title>
            <meta name="description" content="Logg inn for å få tilgang til dashbord, moduler og administrasjon." />
            <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
            <meta name="robots" content="noindex,nofollow" />
          </Helmet>
          <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Logg inn</h1>
          <p className="text-muted-foreground mt-2">
            {userType === 'business' ? 'Bedriftskonto' : 'Privatperson'}
          </p>
        </div>
        <LoginForm 
          userType={userType}
          redirectTo={returnUrl || undefined}
        />
        <div className="mt-4">
          <DevSeedUsers />
        </div>
      </div>
    </div>
  );
};