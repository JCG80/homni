
import { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { LeadForm } from '../components/LeadForm';
import { LeadsTable } from '../components/LeadsTable';
import { Button } from '@/components/ui/button';

export const UserLeadsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return <div>Du må være logget inn for å se dine leads</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mine forespørsler</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Skjul skjema' : 'Ny forespørsel'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Opprett ny forespørsel</h2>
          <LeadForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Dine forespørsler</h2>
        <LeadsTable />
      </div>
    </div>
  );
};
