import React from 'react';
import { Helmet } from 'react-helmet';
import { LoginForm } from '@/modules/auth/components/LoginForm';
import { DevSeedUsers } from '@/modules/auth/components/DevSeedUsers';
import { useSearchParams } from 'react-router-dom';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') === 'business' ? 'business' : 'private';
  const returnUrl = searchParams.get('returnUrl');

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