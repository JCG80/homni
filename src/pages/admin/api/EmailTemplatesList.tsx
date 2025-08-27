
import React, { useEffect, useState } from "react";

type EmailTemplate = {
  id: string;
  key: string;
  subject: string;
  is_active: boolean;
  updated_at: string;
};

const EmailTemplatesList: React.FC = () => {
  const [items, setItems] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    // Placeholder data until database tables are synced
    const placeholderData: EmailTemplate[] = [
      {
        id: "1",
        key: "lead_confirmation",
        subject: "Din forespørsel er mottatt",
        is_active: true,
        updated_at: new Date().toISOString()
      }
    ];
    
    setItems(placeholderData);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
        Laster e-postmaler ...
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
        <h3 className="text-sm font-medium">E-postmaler</h3>
        <span className="text-xs text-muted-foreground">
          Read-only inntil API er klart
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Nøkkel</th>
              <th className="px-4 py-2 text-left font-medium">Emne</th>
              <th className="px-4 py-2 text-left font-medium">Status</th>
              <th className="px-4 py-2 text-left font-medium">Oppdatert</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td
                  className="px-4 py-6 text-center text-muted-foreground"
                  colSpan={4}
                >
                  Ingen maler funnet.
                </td>
              </tr>
            )}
            {items.map((tpl) => (
              <tr key={tpl.id} className="border-t border-border">
                <td className="px-4 py-2">{tpl.key}</td>
                <td className="px-4 py-2">{tpl.subject}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${
                      tpl.is_active
                        ? "bg-green-600/10 text-green-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {tpl.is_active ? "Aktiv" : "Inaktiv"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {new Date(tpl.updated_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
        Endringer kan åpnes for Admin senere (skjema/forhåndsvisning). Nå vises
        kun status.
      </div>
    </div>
  );
};

export default EmailTemplatesList;
