
import { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { LeadForm } from '../components/LeadForm';
import { LeadsTable } from '../components/LeadsTable';
import { Button } from '@/components/ui/button';
import { useRoleGuard } from '@/modules/auth/hooks/useRoleGuard';

export const UserLeadsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const { user, isLoading } = useAuth();
  const { loading } = useRoleGuard({
    allowAnyAuthenticated: true, // Allow any authenticated user to access
    redirectTo: '/login'
  });

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Laster inn...</p>
        </div>
      </div>
    );
  }

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
