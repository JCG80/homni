import React from 'react';
import { Helmet } from 'react-helmet';
import { VisitorWizardDebug } from '@/components/landing/VisitorWizardDebug';
import { ErrorBoundary } from '@/components/debug/ErrorBoundary';

export const DebugHomePage = () => {
  console.log('DebugHomePage rendering - testing VisitorWizard in isolation');

  return (
    <>
      <Helmet>
        <title>Homni - Debug Version</title>
        <meta name="description" content="Testing VisitorWizard functionality" />
      </Helmet>

      <main className="py-16">
        <div className="container mx-auto px-4">
          <ErrorBoundary componentName="VisitorWizardDebug">
            <VisitorWizardDebug />
          </ErrorBoundary>
        </div>
      </main>
    </>
  );
};