
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TEST_USERS, verifyTestUsers } from '@/modules/auth/utils/devLogin';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '@/modules/auth/types/types';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';

interface TestUserManagerProps {
  onLoginClick: (role: UserRole) => Promise<void>;
}

export const TestUserManager = ({ onLoginClick }: TestUserManagerProps) => {
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

  const handleDevLogin = async (role: UserRole) => {
    setLoadingRole(role);
    await onLoginClick(role);
    setLoadingRole(null);
  };

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

  if (isVerifying) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        <span>Verifiserer testbrukere...</span>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <p className="text-sm text-center mb-4">Testbrukere for utvikling</p>
      
      {missingUsers.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Test users missing</AlertTitle>
          <AlertDescription className="text-xs">
            Some test users are not set up in the database.
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runSetupTestUsers}
              className="mt-2 w-full"
            >
              Setup Test Users
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        {TEST_USERS.map((user) => (
          <Button 
            key={user.email}
            onClick={() => handleDevLogin(user.role)}
            className="w-full text-xs"
            variant={missingUsers.includes(user.email) ? "destructive" : "outline"}
            size="sm"
            disabled={isVerifying || loadingRole === user.role}
          >
            {loadingRole === user.role ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Logger inn...
              </>
            ) : missingUsers.includes(user.email) ? (
              <>
                <AlertCircle className="mr-2 h-3 w-3" />
                {user.name} ({user.role}) - Ikke opprettet
              </>
            ) : (
              <>
                {user.name} ({user.role})
              </>
            )}
          </Button>
        ))}
      </div>

      <div className="mt-4 text-xs text-center">
        <details>
          <summary className="cursor-pointer text-muted-foreground">Dev setup instructions</summary>
          <div className="mt-2 p-3 bg-muted rounded-md text-left">
            <p className="font-medium">To create test users:</p>
            <ol className="list-decimal pl-4 mt-1 space-y-1">
              <li>Use the "Setup Test Users" button above</li>
              <li>Or run <code>window.setupTestUsers()</code> in browser console</li>
            </ol>
            <p className="mt-2 font-medium">If login fails after setup:</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>Check if "Confirm Email" is disabled in Supabase Auth settings</li>
              <li>Verify Site URL and Redirect URLs in Supabase Auth settings</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
};
