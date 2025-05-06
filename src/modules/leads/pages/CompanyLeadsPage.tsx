
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { LeadsTable } from '../components/LeadsTable';
import { useRoleGuard } from '@/modules/auth/hooks/useRoleGuard';

export const CompanyLeadsPage = () => {
  const { isLoading } = useAuth();
  const { loading } = useRoleGuard({
    allowedRoles: ['company', 'admin', 'master-admin'],
    redirectTo: '/unauthorized'
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

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bedrift: Tildelte leads</h1>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Dine leads</h2>
        <LeadsTable />
      </div>
    </div>
  );
};
