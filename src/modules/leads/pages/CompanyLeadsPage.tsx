
import React from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { DashboardLayout } from '@/components/dashboard';
import { FileText } from 'lucide-react';

export const CompanyLeadsPage: React.FC = () => {
  const { profile } = useAuth();
  
  return (
    <DashboardLayout title="Bedriftsforespørsler">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Bedriftsforespørsler</h1>
            <p className="text-muted-foreground">
              Administrer innkommende forespørsler for {profile?.full_name || 'din bedrift'}
            </p>
          </div>
        </div>

        {/* Lead management content goes here */}
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <p className="text-lg mb-4">Ingen aktive forespørsler</p>
          <p className="text-muted-foreground">
            Du har ingen innkommende forespørsler for øyeblikket. Nye forespørsler vil vises her når de kommer inn.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyLeadsPage;
