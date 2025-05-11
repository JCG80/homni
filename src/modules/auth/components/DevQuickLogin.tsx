
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { devLogin, TEST_USERS, verifyTestUsers } from '../utils/devLogin';
import { toast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert';

export const DevQuickLogin: React.FC = () => {
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [missingUsers, setMissingUsers] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Only show in development mode
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  // Verify test users on component mount
  useEffect(() => {
    const checkTestUsers = async () => {
      if (import.meta.env.MODE === 'development') {
        setIsVerifying(true);
        try {
          const missing = await verifyTestUsers();
          setMissingUsers(missing);
          
          if (missing.length > 0) {
            toast({
              title: 'Test users missing',
              description: `${missing.length} test users need to be created. Check dev console for details.`,
              variant: 'destructive',
            });
            console.warn('Missing test users:', missing);
          }
        } catch (err) {
          console.error('Error verifying test users:', err);
        } finally {
          setIsVerifying(false);
        }
      }
    };
    
    checkTestUsers();
  }, []);

  const loginAs = async (role: string) => {
    try {
      setLoadingRole(role);
      const user = TEST_USERS.find(u => u.role === role);
      if (!user) return;
      
      if (missingUsers.includes(user.email)) {
        toast({
          title: 'Test user not created',
          description: `The ${role} test user doesn't exist in the database. Please run the setup script.`,
          variant: 'destructive',
        });
        return;
      }
      
      const result = await devLogin(user.role);
      
      if (result.error) {
        toast({
          title: 'Login failed',
          description: result.error.message,
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Login error',
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-slate-800/80 rounded-lg shadow-lg backdrop-blur-sm z-50 max-w-xs">
      <h4 className="text-white font-medium mb-2 text-sm">Dev Quick Login</h4>
      
      {isVerifying ? (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-white mr-2" />
          <span className="text-white text-xs">Verifying test users...</span>
        </div>
      ) : missingUsers.length > 0 ? (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing test users</AlertTitle>
          <AlertDescription className="text-xs">
            {missingUsers.length} test users are not set up in the database. 
            See console for details.
          </AlertDescription>
        </Alert>
      ) : null}
      
      <div className="flex flex-col gap-2">
        {TEST_USERS.map((user) => (
          <Button 
            key={user.email}
            size="sm"
            variant={missingUsers.includes(user.email) ? "destructive" : "outline"}
            onClick={() => loginAs(user.role)}
            disabled={loadingRole === user.role || isVerifying}
            className="text-xs justify-start"
          >
            {loadingRole === user.role ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                {missingUsers.includes(user.email) ? (
                  <AlertCircle className="mr-2 h-3 w-3" />
                ) : null}
                Login as {user.role}
              </>
            )}
          </Button>
        ))}
      </div>
      
      {missingUsers.length > 0 && (
        <div className="mt-3 text-xs text-white">
          <p>Run the user setup script to create missing test users.</p>
        </div>
      )}
    </div>
  );
};
