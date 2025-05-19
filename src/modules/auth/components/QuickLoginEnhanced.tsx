
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TestUser } from '../utils/devLogin';
import { toast } from '@/hooks/use-toast';
import { Key, Search, Users, ChevronRight } from 'lucide-react';
import { useAllUsers } from '../hooks/useAllUsers';
import { impersonateUser } from '../utils/impersonateUser';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export interface QuickLoginEnhancedProps {
  onSuccess?: () => void;
}

export const QuickLoginEnhanced: React.FC<QuickLoginEnhancedProps> = ({ onSuccess }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { 
    users, 
    loading, 
    error: fetchError 
  } = useAllUsers();
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const lowerQuery = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(lowerQuery) ||
      user.name?.toLowerCase().includes(lowerQuery) ||
      user.role?.toLowerCase().includes(lowerQuery)
    );
  });

  // Group users by role for better organization
  const usersByRole = filteredUsers.reduce((acc, user) => {
    const role = user.role || 'unknown';
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(user);
    return acc;
  }, {} as Record<string, typeof users>);

  const handleLoginAs = async (user: TestUser) => {
    try {
      const result = await impersonateUser(user);
      if (result.success) {
        toast({
          title: "Login successful",
          description: `Logged in as ${user.name || user.email} (${user.role})`,
        });
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: "Login failed",
          description: result.error?.message || "Unknown error",
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
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 text-xs" data-test-id="quick-login-trigger">
          <Key className="h-3.5 w-3.5" />
          <span>Quick Login</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-72" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Developer Quick Login</span>
          <Badge variant="outline" className="text-xs">Dev Mode</Badge>
        </DropdownMenuLabel>
        
        <div className="px-2 py-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users..." 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-test-id="quick-login-search"
            />
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : fetchError ? (
          <div className="p-3 text-center text-sm text-destructive">
            Error loading users: {fetchError}
          </div>
        ) : Object.keys(usersByRole).length === 0 ? (
          <div className="p-3 text-center text-sm text-muted-foreground">
            No users found
          </div>
        ) : (
          Object.entries(usersByRole).map(([role, roleUsers]) => (
            <DropdownMenuGroup key={role}>
              {Object.keys(usersByRole).length > 1 && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="capitalize">
                    <Users className="mr-2 h-4 w-4" />
                    {role} ({roleUsers.length})
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {roleUsers.map((user) => (
                      <DropdownMenuItem 
                        key={user.id}
                        onClick={() => handleLoginAs(user)}
                        data-test-id={`quick-login-user-${user.id}`}
                      >
                        {user.name || user.email}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              {Object.keys(usersByRole).length === 1 && roleUsers.map((user) => (
                <DropdownMenuItem 
                  key={user.id}
                  onClick={() => handleLoginAs(user)}
                  data-test-id={`quick-login-user-${user.id}`}
                >
                  {user.name || user.email}
                  <Badge className="ml-2 text-xs" variant="outline">{role}</Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
