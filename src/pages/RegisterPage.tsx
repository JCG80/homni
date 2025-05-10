
import React from 'react';
import { RegisterForm } from '@/modules/auth/components/RegisterForm';
import { Link } from 'react-router-dom';

export const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <Link to="/" className="inline-block mb-6 text-2xl font-bold text-primary">Homni</Link>
          <h1 className="text-3xl font-bold">Registrer deg</h1>
          <p className="text-muted-foreground mt-2">
            Opprett en konto for å få tilgang til alle våre tjenester
          </p>
        </div>
        
        <RegisterForm redirectTo="/dashboard" />
        
        <div className="text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            ← Tilbake til forsiden
          </Link>
        </div>
      </div>
    </div>
  );
};
