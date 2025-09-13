import React from 'react';
import { Helmet } from 'react-helmet';
import { ImprovedAuthStatus } from '@/components/auth/ImprovedAuthStatus';

export default function AuthTestPage() {
  return (
    <>
      <Helmet>
        <title>Autentiseringstest - Homni</title>
        <meta name="description" content="Test innlogging og utlogging" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Autentiseringstest</h1>
          <p className="text-muted-foreground">
            Test innlogging og utlogging her
          </p>
        </div>
        
        <ImprovedAuthStatus />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Hvis du har problemer med innlogging eller utlogging, kan dette verktøyet hjelpe deg å identifisere problemet.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-1">✅ RLS-feil fikset</h3>
              <p className="text-sm text-green-700">
                Uendelig rekursjon i databasepolicies er løst
              </p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-1">🔄 Refresh anbefalt</h3>
              <p className="text-sm text-blue-700">
                Refresh siden for å teste innlogging på nytt
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}