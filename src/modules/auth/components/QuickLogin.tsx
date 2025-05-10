
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TEST_USERS, TestUser, devLogin } from '../utils/devLogin';
import { toast } from '@/hooks/use-toast';
import { Key } from 'lucide-react';

export const QuickLogin = () => {
  const handleLogin = async (user: TestUser) => {
    try {
      const result = await devLogin(user.role);
      if (result.success) {
        toast({
          title: "Login successful",
          description: `Logged in as ${user.role}`,
        });
      } else if (result.error) {
        toast({
          title: "Login failed",
          description: result.error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      toast({
        title: "Login error",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Only show in development mode
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded bg-slate-100 px-3 py-1.5 text-xs hover:bg-slate-200">
        <Key className="h-3.5 w-3.5" />
        <span>Quick Login</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Development Login</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {TEST_USERS.map((user) => (
          <DropdownMenuItem key={user.role} onClick={() => handleLogin(user)}>
            {user.name || user.role}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
