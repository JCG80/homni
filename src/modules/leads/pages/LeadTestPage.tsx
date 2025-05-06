
import { LeadInsertTest } from '../tests/LeadInsertTest';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export const LeadTestPage = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="container mx-auto py-8">Laster inn...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Lead Module Tests</h1>
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">insertLead() Function Test</h2>
            <LeadInsertTest />
          </div>
        </div>
      </div>
    </div>
  );
};
