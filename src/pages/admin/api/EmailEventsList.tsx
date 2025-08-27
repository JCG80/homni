
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type EmailEvent = {
  id: string;
  template_key: string;
  to_email: string;
  provider: string | null;
  status: string;
  error: string | null;
  created_at: string;
  sent_at: string | null;
  lead_id: string | null;
};

const EmailEventsList: React.FC = () => {
  const [items, setItems] = useState<EmailEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    console.log("[EmailEventsList] fetching email_events");
    supabase
      .from("email_events")
      .select(
        "id,template_key,to_email,provider,status,error,created_at,sent_at,lead_id"
      )
      .order("created_at", { ascending: false })
      .limit(25)
      .then(({ data, error }) => {
        if (error) {
          console.error("[EmailEventsList] error", error);
          setErrorText(
            error.message ||
              "Kun administratorer kan lese e-posthendelser (RLS)."
          );
        } else {
          console.log("[EmailEventsList] data", data);
          setItems((data as EmailEvent[]) || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
        Laster e-posthendelser ...
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
        <h3 className="text-sm font-medium">E-posthendelser (siste 25)</h3>
        <span className="text-xs text-muted-foreground">
          Vises når sending kobles på
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Tid</th>
              <th className="px-4 py-2 text-left font-medium">Template</th>
              <th className="px-4 py-2 text-left font-medium">Til</th>
              <th className="px-4 py-2 text-left font-medium">Provider</th>
              <th className="px-4 py-2 text-left font-medium">Status</th>
              <th className="px-4 py-2 text-left font-medium">Feil</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td
                  className="px-4 py-6 text-center text-muted-foreground"
                  colSpan={6}
                >
                  Ingen hendelser registrert enda.
                </td>
              </tr>
            )}
            {items.map((ev) => (
              <tr key={ev.id} className="border-t border-border">
                <td className="px-4 py-2">
                  {new Date(ev.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2">{ev.template_key}</td>
                <td className="px-4 py-2">{ev.to_email}</td>
                <td className="px-4 py-2">{ev.provider || "-"}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${
                      ev.status === "sent"
                        ? "bg-green-600/10 text-green-600"
                        : ev.status === "failed"
                        ? "bg-red-600/10 text-red-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {ev.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {ev.error ? (
                    <span className="text-red-600">{ev.error}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
        Når e-postsending kobles på via Edge Function, vil nye hendelser logges
        her.
      </div>
    </div>
  );
};

export default EmailEventsList;
