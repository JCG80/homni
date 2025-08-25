
import React from 'react';
import { LeadForm } from '../components/LeadForm';
import { useRoleProtection } from '@/modules/auth/hooks';

export const LeadCapturePage = () => {
  const { loading } = useRoleProtection({
    allowAnyAuthenticated: true,
    redirectTo: '/login'
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Laster inn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Legg inn ny forespørsel</h1>
      
      <div className="bg-card rounded-lg shadow-sm border p-6 max-w-2xl mx-auto">
        <p className="text-muted-foreground mb-6">
          Fyll ut skjemaet under for å sende inn en forespørsel. Vi vil kontakte deg 
          så fort som mulig.
        </p>
        
        <LeadForm onSuccess={() => {
          window.scrollTo(0, 0);
        }} />
      </div>
    </div>
  );
};
