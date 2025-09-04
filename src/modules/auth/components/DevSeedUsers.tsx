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
        toast.error(`Klarte ikke å opprette testbrukere: ${error.message || 'Ukjent feil'}`);
        return;
      }

      if (data && (data as any).ok === false) {
        const msg = (data as any).error || 'Ukjent feil fra funksjonen';
        toast.error(`Klarte ikke å opprette testbrukere: ${msg}`);
        console.error('Seed function response error:', data);
        return;
      }

      toast.success('Testbrukere opprettet/oppdatert. Prøv å logge inn igjen.');
      console.log('Seed result:', data);
    } catch (e: any) {
      console.error('Seed error', e);
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