import React, { useEffect, useState } from 'react';
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
  const [forceRender, setForceRender] = useState(false);

  // EMERGENCY: Force rendering after timeout
  useEffect(() => {
    console.log('[EMERGENCY LoginPage] Component rendered:', {
      isAuthenticated,
      role,
      isLoading,
      userType,
      returnUrl,
      pathname: window.location.pathname,
      search: window.location.search
    });
    
    // EMERGENCY: Force rendering after 500ms - align with auth timeout
    const emergencyTimeout = setTimeout(() => {
      console.log('[EMERGENCY LoginPage] Forcing render after 500ms timeout');
      setForceRender(true);
    }, 500);
    
    return () => clearTimeout(emergencyTimeout);
  }, [isAuthenticated, role, isLoading, userType, returnUrl]);

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && role && !isLoading) {
      const redirectTo = returnUrl || routeForRole(role as UserRole);
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, role, isLoading, returnUrl, navigate]);

  // EMERGENCY: Show loading but with timeout - force render after timeout
  if (isLoading && !forceRender) {
    console.log('[EMERGENCY LoginPage] Showing loading state (will timeout)');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Sjekker innlogging...</p>
          <p className="text-xs text-muted-foreground mt-2">Venter maks 1 sekund...</p>
        </div>
      </div>
    );
  }

  // EMERGENCY: Don't render login form if user is already authenticated (will redirect)
  // But only if we haven't forced rendering
  if (isAuthenticated && role && !forceRender) {
    console.log('[EMERGENCY LoginPage] User already authenticated, returning null');
    return null;
  }

  console.log('[EMERGENCY LoginPage] Rendering login form');
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