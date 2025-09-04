import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const DevSeedUsers: React.FC = () => {

  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('seed-test-users', {
        body: {},
      });

      if (error) {
        console.error('Seed error (invoke)', error);
        const msg = error.message || String(error);
        if (/401|jwt|authorized|unauthor/i.test(msg)) {
          toast.error('Funksjonen krever tilgang. Forsøk igjen nå som konfigureringen er oppdatert.');
        } else {
          toast.error(`Klarte ikke å opprette testbrukere: ${msg}`);
        }
        return;
      }

      if (!data) {
        toast.error('Ingen respons fra seed-funksjonen. Se konsoll.');
        console.error('Seed function returned no data');
        return;
      }

      const payload = data as any;
      if (payload.ok === false) {
        const results = Array.isArray(payload.results) ? payload.results : [];
        const failed = results.filter((r: any) => r && r.error).length;
        const succeeded = results.length - failed;
        const firstError = results.find((r: any) => r && r.error)?.error;
        toast.error(`Noen brukere feilet (${failed}). Lyktes: ${succeeded}. ${firstError ? 'Første feil: ' + firstError : ''}`);
        console.error('Seed function response error:', payload);
        return;
      }

      toast.success('Testbrukere opprettet/oppdatert. Prøv å logge inn igjen.');
      console.log('Seed result:', data);
    } catch (e: any) {
      console.error('Seed error (exception)', e);
      toast.error(`Klarte ikke å opprette testbrukere. ${e?.message ? '(' + e.message + ')' : 'Se konsoll for detaljer.'}`);
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