
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { devLogin, TEST_USERS } from '../utils/devLogin';
import { toast } from '@/hooks/use-toast';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Loader2 } from 'lucide-react';

export const DevQuickLogin: React.FC = () => {
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  
  // Only show in development mode
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  const loginAs = async (role: string) => {
    try {
      setLoadingRole(role);
      const user = TEST_USERS.find(u => u.role === role);
      if (!user) return;
      
      const result = await devLogin(user.role);
      
      if (result.error) {
        toast({
          title: 'Login failed',
          description: result.error.message,
          variant: 'destructive',
        });
        return;
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
    <div className="fixed bottom-4 right-4 p-4 bg-slate-800/80 rounded-lg shadow-lg backdrop-blur-sm z-50">
      <h4 className="text-white font-medium mb-2 text-sm">Dev Quick Login</h4>
      <div className="flex flex-col gap-2">
        {TEST_USERS.map((user) => (
          <Button 
            key={user.email}
            size="sm"
            variant="outline"
            onClick={() => loginAs(user.role)}
            disabled={loadingRole === user.role}
            className="text-xs justify-start"
          >
            {loadingRole === user.role ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Logging in...
              </>
            ) : (
              <>Login as {user.role}</>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};
