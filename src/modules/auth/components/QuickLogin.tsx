
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TEST_USERS, devLogin, TestUser } from '../utils/devLogin';
import { toast } from '@/hooks/use-toast';
import { Key } from 'lucide-react';

export const QuickLogin = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleLogin = async (user: TestUser) => {
    setLoading(user.email);
    
    try {
      const result = await devLogin(user.email);
      
      if (result.success) {
        toast({
          title: 'Magic link sent',
          description: `Check your console, network tab or Supabase logs for the login URL for ${user.name} (${user.role})`,
        });
      } else {
        toast({
          title: 'Dev login failed',
          description: result.error || 'Unknown error',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Dev login error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  // Only show in development mode
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-yellow-100 border-yellow-300 hover:bg-yellow-200">
            <Key className="h-4 w-4 mr-2" />
            Quick Dev Login
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Select test user</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {TEST_USERS.map((user) => (
            <DropdownMenuItem
              key={user.email}
              disabled={loading !== null}
              onClick={() => handleLogin(user)}
              className="cursor-pointer flex items-center justify-between gap-4"
            >
              <span>{user.name}</span>
              <span className="text-xs px-2 py-1 rounded bg-gray-100">
                {user.role}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
