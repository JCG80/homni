
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Integration = {
  id: string;
  name: string;
  provider: string;
  category: string;
  is_enabled: boolean;
  secret_name: string | null;
  created_at: string;
  updated_at: string;
  config: Record<string, unknown>;
};

const IntegrationsList: React.FC = () => {
  const [items, setItems] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    console.log("[IntegrationsList] fetching external_integrations");
    supabase
      .from("external_integrations")
      .select("*")
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("[IntegrationsList] error", error);
          setErrorText(
            error.message ||
              "Kun administratorer kan lese integrasjoner (RLS)."
          );
        } else {
          console.log("[IntegrationsList] data", data);
          setItems((data as Integration[]) || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

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
              <th className="px-4 py-2 text-left font-medium">Provider</th>
              <th className="px-4 py-2 text-left font-medium">Kategori</th>
              <th className="px-4 py-2 text-left font-medium">Status</th>
              <th className="px-4 py-2 text-left font-medium">Secret</th>
              <th className="px-4 py-2 text-left font-medium">Oppdatert</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td
                  className="px-4 py-6 text-center text-muted-foreground"
                  colSpan={6}
                >
                  Ingen integrasjoner registrert enda.
                </td>
              </tr>
            )}
            {items.map((it) => (
              <tr key={it.id} className="border-t border-border">
                <td className="px-4 py-2">{it.name}</td>
                <td className="px-4 py-2">{it.provider}</td>
                <td className="px-4 py-2">{it.category}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${
                      it.is_enabled
                        ? "bg-green-600/10 text-green-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {it.is_enabled ? "Aktivert" : "Deaktivert"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {it.secret_name ? (
                    <code className="text-xs">{it.secret_name}</code>
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      Ikke satt
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {new Date(it.updated_at).toLocaleString()}
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
