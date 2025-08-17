
import React from 'react';

export const TestInstructions = () => {
  return (
    <details className="text-xs cursor-pointer text-muted-foreground">
      <summary>Dev setup instructions</summary>
      <div className="mt-2 p-3 bg-muted rounded-md text-left">
        <p className="font-medium">For å opprette testbrukere:</p>
        <ol className="list-decimal pl-4 mt-1 space-y-1">
          <li>Bruk "Setup Test Users" knappen ovenfor</li>
          <li>Eller kjør <code>window.setupTestUsers()</code> i browser console</li>
        </ol>
        <p className="mt-2 font-medium">Hvis innlogging feiler etter oppsett:</p>
        <ul className="list-disc pl-4 mt-1 space-y-1">
          <li>Sjekk at "Confirm Email" er deaktivert i Supabase Auth settings</li>
          <li>Verifiser Site URL og Redirect URLs i Supabase Auth settings</li>
          <li>Hvis siden henger på "Verifiserer...", refresh siden</li>
        </ul>
      </div>
    </details>
  );
};
