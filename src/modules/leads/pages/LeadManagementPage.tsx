
import React, { useEffect, useState } from 'react';
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
  const [showLoadingUI, setShowLoadingUI] = useState(false);

  useEffect(() => {
    // Log for debugging
    console.log('LeadManagementPage - Current role:', role);
  }, [role]);

  // Only show loading UI after a short delay to prevent flash
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowLoadingUI(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowLoadingUI(false);
    }
  }, [isLoading]);

  // Protection against infinite loading state
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('Auth loading taking too long in LeadManagementPage, proceeding anyway');
        setShowLoadingUI(false);
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Show loading state while checking auth, but only if it takes more than a moment
  if (isLoading && showLoadingUI) {
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
  if (!isLoading && !isAuthenticated) {
    toast({
      title: "Ikke innlogget",
      description: "Du må være innlogget for å se forespørsler",
      variant: "destructive"
    });
    return <Navigate to="/login" state={{ returnUrl: '/leads' }} />;
  }

  // If auth is still loading but we don't want to show loading UI, render minimal placeholder
  if (isLoading) {
    return <></>;
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
