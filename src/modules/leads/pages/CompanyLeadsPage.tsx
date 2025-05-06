
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { LeadsTable } from '../components/LeadsTable';
import { Navigate } from 'react-router-dom';

export const CompanyLeadsPage = () => {
  const { isCompany, isLoading } = useAuth();

  if (isLoading) {
    return <div>Laster inn...</div>;
  }

  if (!isCompany) {
    return <Navigate to="/unauthorized" replace />;
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
