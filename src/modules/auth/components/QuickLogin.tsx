
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
import { TEST_USERS, devLogin, devLoginAs, TestUser } from '../utils/devLogin';
import { toast } from '@/hooks/use-toast';
import { Key } from 'lucide-react';
import { UserRole } from '../types/types';

export const QuickLogin = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleLogin = async (user: TestUser) => {
    setLoading(user.email);
    
    try {
      const result = await devLogin(user.email);
      
      if (result.success) {
        toast({
          title: 'Login successful',
          description: `Logged in as ${user.name} (${user.role})`,
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

  const handleLoginByRole = async (role: UserRole) => {
    setLoading(role);
    
    try {
      const result = await devLoginAs(role);
      
      if (result.success) {
        toast({
          title: 'Role-based login successful',
          description: `Logged in with role: ${role}`,
        });
      } else {
        toast({
          title: 'Role-based login failed',
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
      <div className="flex flex-col gap-2">
        {/* Quick login by role buttons */}
        <div className="flex gap-2 justify-end">
          <Button 
            variant="outline" 
            size="sm"
            className="bg-gray-100 border-gray-300 hover:bg-gray-200"
            disabled={loading !== null}
            onClick={() => handleLoginByRole('user')}
          >
            Login as User
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-blue-100 border-blue-300 hover:bg-blue-200"
            disabled={loading !== null}
            onClick={() => handleLoginByRole('company')}
          >
            Login as Company
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-purple-100 border-purple-300 hover:bg-purple-200"
            disabled={loading !== null}
            onClick={() => handleLoginByRole('admin')}
          >
            Login as Admin
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-red-100 border-red-300 hover:bg-red-200"
            disabled={loading !== null}
            onClick={() => handleLoginByRole('master-admin')}
          >
            Login as Master Admin
          </Button>
        </div>

        {/* Traditional dropdown with specific users */}
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
    </div>
  );
};
