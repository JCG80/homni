
import React, { useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { AdminLeadsPage } from './AdminLeadsPage';
import { CompanyLeadsPage } from './CompanyLeadsPage';
import { UserLeadsPage } from './UserLeadsPage';
import { Loader2 } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

/**
 * Lead Management Page that dynamically displays the appropriate leads page based on user role
 */
export const LeadManagementPage: React.FC = () => {
  const { isLoading, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Log for debugging
    console.log('LeadManagementPage - Current role:', role);
  }, [role]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Laster inn forespørselsdata...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    toast({
      title: "Ikke innlogget",
      description: "Du må være innlogget for å se forespørsler",
      variant: "destructive"
    });
    return <Navigate to="/login" state={{ returnUrl: '/leads' }} />;
  }

  // Render the appropriate leads page based on user role
  switch (role) {
    case 'admin':
    case 'master_admin':
      return <AdminLeadsPage />;
    case 'company':
      return <CompanyLeadsPage />;
    case 'member':
      return <UserLeadsPage />;
    default:
      // If role is unrecognized or not yet loaded, show a message
      if (!role) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg">Bestemmer brukerrolle...</p>
            </div>
          </div>
        );
      }
      
      // If role is invalid, redirect to unauthorized
      toast({
        title: "Ingen tilgang",
        description: "Du har ikke tilgang til å se forespørsler med din rolle",
        variant: "destructive"
      });
      return <Navigate to="/unauthorized" />;
  }
};

export default LeadManagementPage;
