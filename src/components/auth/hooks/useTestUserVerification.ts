
import { useState, useEffect } from 'react';
import { TEST_USERS } from '@/modules/auth/utils/devLogin';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { setupTestUsers } from '@/modules/auth/utils/setupTestUsers';

// Check if test users exist in the database
const verifyTestUsers = async (): Promise<string[]> => {
  try {
    const missingUsers: string[] = [];
    
    for (const user of TEST_USERS) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', user.email)
        .single();
      
      if (error || !data) {
        missingUsers.push(user.email);
      }
    }
    
    return missingUsers;
  } catch (err) {
    console.error('Error verifying test users:', err);
    return TEST_USERS.map(user => user.email);
  }
};

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
      setIsVerifying(true);
      toast({
        title: 'Oppretter testbrukere',
        description: 'Lager testbrukere i databasen...',
      });
      
      const result = await setupTestUsers();
      
      // Verify which users were successfully created
      const missing = await verifyTestUsers();
      setMissingUsers(missing);
      
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
    } catch (error: any) {
      toast({
        title: 'Feil ved oppretting av testbrukere',
        description: error.message || 'En ukjent feil oppstod',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
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
