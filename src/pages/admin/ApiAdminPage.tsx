
import React from "react";
import IntegrationsList from "./api/IntegrationsList";
import EmailTemplatesList from "./api/EmailTemplatesList";
import EmailEventsList from "./api/EmailEventsList";

const ApiAdminPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">API & Integrasjoner</h1>
        <p className="text-sm text-muted-foreground">
          Konfigurasjon og oversikt. Klar til bruk når API/hemmeligheter er satt.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <section className="space-y-3">
          <h2 className="text-sm font-medium">Integrasjoner</h2>
          <IntegrationsList />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium">E-postmaler</h2>
          <EmailTemplatesList />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium">E-posthendelser</h2>
          <EmailEventsList />
        </section>
      </div>

      <div className="rounded-md border border-border p-4 text-xs text-muted-foreground">
        Merk: Denne siden er lesbar og konfigurasjonsklar. Når dere legger til
        provider-nøkkel som Supabase Secret og eventuelt Edge Function for
        sending, kan integrasjon aktiveres og hendelser begynner å logges.
      </div>
    </div>
  );
};

export default ApiAdminPage;
