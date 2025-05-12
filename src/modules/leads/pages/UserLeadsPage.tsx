
import React from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { DashboardLayout } from '@/components/dashboard';
import { FileText } from 'lucide-react';

export const UserLeadsPage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <DashboardLayout title="Mine forespørsler">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Mine forespørsler</h1>
            <p className="text-muted-foreground">
              Se status på dine sendte forespørsler
            </p>
          </div>
        </div>

        {/* User leads content goes here */}
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <p className="text-lg mb-4">Ingen aktive forespørsler</p>
          <p className="text-muted-foreground">
            Du har ingen aktive forespørsler for øyeblikket. Når du sender forespørsler til tjenesteleverandører, vil de vises her.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserLeadsPage;
