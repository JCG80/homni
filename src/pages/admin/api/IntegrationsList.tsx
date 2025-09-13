
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

type Integration = {
  id: string;
  name: string;
  service_type: string;
  status: string;
  credentials_configured: boolean;
  endpoint_url: string | null;
  created_at: string;
  updated_at: string;
  configuration: any;
  api_version: string | null;
  error_message: string | null;
};

const IntegrationsList: React.FC = () => {
  const [items, setItems] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('api_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      setErrorText(err.message || 'Kunne ikke laste integrasjoner');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (integration: Integration) => {
    setTestingConnection(integration.id);
    try {
      // Mock connection test - in real implementation this would check API connectivity
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log the test attempt
      await supabase.from('api_request_logs').insert({
        integration_id: integration.id,
        request_method: 'GET',
        request_url: '/health',
        response_status: 200,
        response_time_ms: 150,
        request_body: { test: true },
        response_body: { status: 'ok', mock: true }
      });
      
      alert(`✅ ${integration.name}: Tilkobling OK (mock test)`);
    } catch (err) {
      alert(`❌ ${integration.name}: Tilkoblingsfeil`);
    } finally {
      setTestingConnection(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
        Laster integrasjoner ...
      </div>
    );
  }

  if (errorText) {
    return (
      <div className="rounded-md border border-destructive text-destructive p-4 text-sm">
        {errorText}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-medium">Eksterne integrasjoner</h3>
        <span className="text-xs text-muted-foreground">
          Klart for aktivering når hemmeligheter er satt
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Navn</th>
              <th className="px-4 py-2 text-left font-medium">Tjeneste</th>
              <th className="px-4 py-2 text-left font-medium">Status</th>
              <th className="px-4 py-2 text-left font-medium">Konfig</th>
              <th className="px-4 py-2 text-left font-medium">Endpoint</th>
              <th className="px-4 py-2 text-left font-medium">Oppdatert</th>
              <th className="px-4 py-2 text-left font-medium">Handlinger</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td
                  className="px-4 py-6 text-center text-muted-foreground"
                  colSpan={7}
                >
                  Ingen integrasjoner registrert enda.
                </td>
              </tr>
            )}
            {items.map((it) => (
              <tr key={it.id} className="border-t border-border">
                <td className="px-4 py-2">{it.name}</td>
                <td className="px-4 py-2">{it.service_type}</td>
                <td className="px-4 py-2">
                  <Badge variant={it.status === 'active' ? "default" : "secondary"}>
                    {it.credentials_configured ? (
                      <><CheckCircle className="w-3 h-3 mr-1" /> {it.status}</>
                    ) : (
                      <><AlertCircle className="w-3 h-3 mr-1" /> Ikke konfigurert</>
                    )}
                  </Badge>
                </td>
                <td className="px-4 py-2">
                  <Badge variant={it.credentials_configured ? "default" : "outline"}>
                    {it.credentials_configured ? "Konfigurert" : "Mangler"}
                  </Badge>
                </td>
                <td className="px-4 py-2">
                  {it.endpoint_url ? (
                    <code className="text-xs">{it.endpoint_url}</code>
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      Ikke satt
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {new Date(it.updated_at).toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testConnection(it)}
                    disabled={testingConnection === it.id}
                  >
                    {testingConnection === it.id ? 'Tester...' : 'Test'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
        Tips: Legg inn leverandørens API-nøkkel som Supabase Secret og referer
        den i feltet secret_name. Aktiver integrasjonen når alt er validert.
      </div>
    </div>
  );
};

export default IntegrationsList;
