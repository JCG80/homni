import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const DevSeedUsers: React.FC = () => {
  // Only render in development mode
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('seed-test-users', {
        body: {},
      });

      if (error) {
        const msg = error.message || String(error);
        if (/401|jwt|authorized|unauthor/i.test(msg)) {
          toast({
            title: "Error",
            description: "Funksjonen krever tilgang. Forsøk igjen nå som konfigureringen er oppdatert.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error", 
            description: `Klarte ikke å opprette testbrukere: ${msg}`,
            variant: "destructive"
          });
        }
        return;
      }

      if (!data) {
        toast({
          title: "Error",
          description: "Ingen respons fra seed-funksjonen. Se konsoll.",
          variant: "destructive"
        });
        return;
      }

      const payload = data as any;
      if (payload.ok === false) {
        const results = Array.isArray(payload.results) ? payload.results : [];
        const failed = results.filter((r: any) => r && r.error).length;
        const succeeded = results.length - failed;
        const firstError = results.find((r: any) => r && r.error)?.error;
        toast({
          title: "Error",
          description: `Noen brukere feilet (${failed}). Lyktes: ${succeeded}. ${firstError ? 'Første feil: ' + firstError : ''}`,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success", 
        description: "Testbrukere opprettet/oppdatert. Prøv å logge inn igjen."
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Klarte ikke å opprette testbrukere. ${e?.message ? '(' + e.message + ')' : 'Se konsoll for detaljer.'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Button variant="secondary" onClick={handleSeed} disabled={loading}>
        {loading ? 'Oppretter testbrukere…' : 'Fiks innlogging (opprett testbrukere)'}
      </Button>
    </div>
  );
};