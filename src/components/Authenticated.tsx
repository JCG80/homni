
import { ReactNode, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { createProfile } from '@/modules/auth/api';
import { toast } from '@/hooks/use-toast';

interface AuthenticatedProps {
  children: ReactNode;
}

export const Authenticated = ({ children }: AuthenticatedProps) => {
  const { user, profile, isLoading, refreshProfile } = useAuth();
  const location = useLocation();
  const [creatingProfile, setCreatingProfile] = useState(false);

  const handleCreateProfile = async () => {
    if (!user) return;
    
    setCreatingProfile(true);
    try {
      // Create a basic profile with default member role
      const newProfile = await createProfile({
        id: user.id,
        role: 'member',
        full_name: user.email?.split('@')[0] || 'User'
      });
      
      if (newProfile) {
        toast({
          title: "Profil opprettet",
          description: "Din brukerprofil ble opprettet. Laster inn...",
        });
        
        // Refresh the profile in the auth state
        await refreshProfile();
      } else {
        toast({
          title: "Feil ved opprettelse",
          description: "Kunne ikke opprette brukerprofil. Vennligst prøv igjen.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({
        title: "Feil ved opprettelse",
        description: "Kunne ikke opprette brukerprofil. Vennligst prøv igjen.",
        variant: "destructive"
      });
    } finally {
      setCreatingProfile(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Laster inn bruker...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Pass the current location so we can redirect back after login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  if (!profile) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto mt-16">
        <div className="text-5xl mb-4">🚫</div>
        <h2 className="text-xl font-bold text-red-700 mb-4">Fant ikke brukerprofil</h2>
        <p className="mb-6 text-gray-700">
          Din brukerkonto mangler en tilknyttet profil i databasen.
        </p>
        <div className="space-y-4">
          <Button 
            onClick={handleCreateProfile} 
            disabled={creatingProfile}
            className="w-full"
          >
            {creatingProfile ? 'Oppretter profil...' : 'Opprett profil'}
          </Button>
          
          <p className="text-sm text-gray-600">
            Eller du kan kontakte administrator eller prøve å logge inn på nytt.
          </p>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/login'}
            className="w-full"
          >
            Logg inn på nytt
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
