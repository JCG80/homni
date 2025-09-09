import React from 'react';
import { Helmet } from 'react-helmet';
import { PageLayout } from '@/components/layout/PageLayout';

export const DebugHomePage = () => {
  // Only show debug page in development
  if (import.meta.env.MODE !== 'development') {
    return (
      <PageLayout>
        <div className="container mx-auto py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Debug Side</h1>
          <p className="text-muted-foreground">
            Denne siden er kun tilgjengelig i utviklingsmiljø.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Homni - Debug Version</title>
        <meta name="description" content="Development tools and testing" />
      </Helmet>

      <PageLayout>
        <div className="container mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Debug Side</h1>
            <p className="text-muted-foreground">
              Utviklingsverktøy og testkomponenter
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Merk:</strong> Denne siden er kun tilgjengelig i utviklingsmiljø
                og vil ikke vises i produksjon.
              </p>
            </div>
            
            {/* Development tools can be added here */}
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Debug-verktøy kan legges til her etter behov
              </p>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
};