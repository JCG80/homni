
import React from 'react';
import { Button } from '@/components/ui/button';
import { signInWithEmail } from '../api';
import { toast } from '@/hooks/use-toast';
import { TEST_USERS } from '../__tests__/utils/testAuth';

export const DevQuickLogin: React.FC = () => {
  // Only show in development mode
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  const loginAs = async (email: string, password: string, roleName: string) => {
    try {
      const { user, error } = await signInWithEmail(email, password);
      
      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      if (user) {
        toast({
          title: 'Login successful',
          description: `Logged in as ${roleName} (${email})`,
        });
      }
    } catch (err) {
      toast({
        title: 'Login error',
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
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
            onClick={() => loginAs(user.email, user.password, user.name)}
            className="text-xs justify-start"
          >
            Login as {user.role}
          </Button>
        ))}
      </div>
    </div>
  );
};
