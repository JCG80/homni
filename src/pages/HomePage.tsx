
import React from 'react';
import { Sidebar } from '@/components/ui/sidebar';

export const HomePage = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r border-border bg-card">
        <Sidebar />
      </aside>
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Velkommen</h1>
        <p className="text-muted-foreground mb-4">
          Velg en modul fra sidemenyen for å komme i gang.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Prosjektdokumentasjon</h2>
            <p className="text-muted-foreground mb-4">Se prosjektplanen og dokumentasjon</p>
            <a href="/docs/project-plan" className="text-primary hover:underline">Gå til prosjektplan →</a>
          </div>
          
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Lead håndtering</h2>
            <p className="text-muted-foreground mb-4">Administrer leads og innstillinger</p>
            <a href="/lead-management" className="text-primary hover:underline">Se leads →</a>
          </div>
          
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Brukeradministrasjon</h2>
            <p className="text-muted-foreground mb-4">Administrer brukere og roller</p>
            <a href="/auth-management" className="text-primary hover:underline">Gå til administrasjon →</a>
          </div>
        </div>
      </main>
    </div>
  );
};
