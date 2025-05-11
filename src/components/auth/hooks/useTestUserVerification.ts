
import { useState, useEffect } from 'react';
import { TEST_USERS, verifyTestUsers } from '@/modules/auth/utils/devLogin';
import { toast } from '@/hooks/use-toast';

export const useTestUserVerification = () => {
  const [missingUsers, setMissingUsers] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  // Verify test users on component mount in development mode
  useEffect(() => {
    const checkTestUsers = async () => {
      if (import.meta.env.MODE === 'development') {
        setIsVerifying(true);
        try {
          const missing = await verifyTestUsers();
          setMissingUsers(missing);
        } catch (err) {
          console.error('Error verifying test users:', err);
        } finally {
          setIsVerifying(false);
        }
      }
    };
    
    checkTestUsers();
  }, []);

  const runSetupTestUsers = async () => {
    try {
      // @ts-ignore - This is defined in setupTestUsers.ts
      if (window.setupTestUsers) {
        toast({
          title: 'Oppretter testbrukere',
          description: 'Lager testbrukere i databasen...',
        });
        // @ts-ignore
        await window.setupTestUsers();
        setIsVerifying(true);
        const missing = await verifyTestUsers();
        setMissingUsers(missing);
        setIsVerifying(false);
        
        if (missing.length === 0) {
          toast({
            title: 'Vellykket',
            description: 'Alle testbrukere ble opprettet',
          });
        } else {
          toast({
            title: 'Delvis vellykket',
            description: `${missing.length} testbrukere kunne ikke opprettes`,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Setup-funksjon ikke funnet',
          description: 'setupTestUsers-funksjonen er ikke tilgjengelig',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Feil ved oppretting av testbrukere',
        description: error.message || 'En ukjent feil oppstod',
        variant: 'destructive',
      });
    }
  };

  return {
    missingUsers,
    isVerifying,
    loadingRole,
    setLoadingRole,
    runSetupTestUsers
  };
};
