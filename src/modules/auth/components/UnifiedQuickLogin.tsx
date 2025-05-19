
import React, { useState } from 'react';
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
import { QuickLoginUser } from '../types/unified-types';
import { toast } from '@/hooks/use-toast';
import { Key, Search, Users, ChevronRight } from 'lucide-react';
import { useAllUsers } from '../hooks/useAllUsers';
import { impersonateUser } from '../utils/impersonateUser';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

export interface UnifiedQuickLoginProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const UnifiedQuickLogin: React.FC<UnifiedQuickLoginProps> = ({ 
  onSuccess, 
  redirectTo = '/dashboard'
}) => {
  const [activeTab, setActiveTab] = useState<'private' | 'company'>('private');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const { 
    users, 
    loading, 
    error: fetchError 
  } = useAllUsers();
  
  // Filter users based on active tab
  const filterUsersByTab = (users: QuickLoginUser[]) => {
    return users.filter(user => {
      if (activeTab === 'private') {
        return user.role === 'member' || user.role === 'admin' || user.role === 'master_admin' || user.role === 'content_editor';
      } else {
        return user.role === 'company';
      }
    });
  };

  // Filter users based on search query
  const filterUsersBySearch = (users: QuickLoginUser[]) => {
    const lowerQuery = searchQuery.toLowerCase();
    return users.filter(user => {
      return (
        user.email?.toLowerCase().includes(lowerQuery) ||
        user.name?.toLowerCase().includes(lowerQuery) ||
        user.role?.toLowerCase().includes(lowerQuery)
      );
    });
  };

  // Apply both filters
  const filteredUsers = filterUsersBySearch(filterUsersByTab(users));

  // Group users by role for better organization
  const usersByRole = filteredUsers.reduce((acc, user) => {
    const role = user.role || 'unknown';
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(user);
    return acc;
  }, {} as Record<string, QuickLoginUser[]>);

  const handleLoginAs = async (user: QuickLoginUser) => {
    try {
      const result = await impersonateUser(user);
      if (result.success) {
        toast({
          title: "Innlogget",
          description: `Du er nå logget inn som ${user.name || user.email} (${user.role})`,
        });
        
        if (onSuccess) {
          onSuccess();
        } else {
          // Redirect based on role or to default dashboard
          const rolePath = user.role && ['member', 'company', 'admin', 'master_admin', 'content_editor'].includes(user.role) 
            ? `/dashboard/${user.role}` 
            : redirectTo;
            
          navigate(rolePath, { replace: true });
        }
      } else {
        toast({
          title: "Innlogging feilet",
          description: result.error?.message || "Ukjent feil",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      toast({
        title: "Innloggingsfeil",
        description: err instanceof Error ? err.message : "Ukjent feil oppstod",
        variant: "destructive",
      });
    }
  };

  // Only show in development mode
  if (import.meta.env.MODE !== 'development') {
    return null;
  }
  
  // Translation map for tab display
  const tabLabels = {
    'private': 'Privatperson',
    'company': 'Bedrift'
  };

  // Use Tabs for Private/Business separation
  if (activeTab === 'company' && usersByRole['company']?.length === 0 && !loading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'private' | 'company')}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="private">{tabLabels.private}</TabsTrigger>
            <TabsTrigger value="company">{tabLabels.company}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="company" className="space-y-4">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Ingen bedriftsbrukere tilgjengelig.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab('private')} 
                className="mt-2"
              >
                Se privatbrukere
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'private' | 'company')}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="private">{tabLabels.private}</TabsTrigger>
          <TabsTrigger value="company">{tabLabels.company}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="private">
          <QuickLoginTab 
            usersByRole={usersByRole}
            loading={loading}
            fetchError={fetchError}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleLoginAs={handleLoginAs}
            activeTab={activeTab}
          />
        </TabsContent>
        
        <TabsContent value="company">
          <QuickLoginTab 
            usersByRole={usersByRole}
            loading={loading}
            fetchError={fetchError}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleLoginAs={handleLoginAs}
            activeTab={activeTab}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface QuickLoginTabProps {
  usersByRole: Record<string, QuickLoginUser[]>;
  loading: boolean;
  fetchError: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleLoginAs: (user: QuickLoginUser) => void;
  activeTab: 'private' | 'company';
}

const QuickLoginTab: React.FC<QuickLoginTabProps> = ({
  usersByRole,
  loading,
  fetchError,
  searchQuery,
  setSearchQuery,
  handleLoginAs,
  activeTab
}) => {
  // Display name mapping for roles
  const roleDisplayNames: Record<string, string> = {
    'member': 'Medlem',
    'company': 'Bedrift',
    'admin': 'Admin',
    'master_admin': 'Master Admin',
    'content_editor': 'Innholdsredaktør'
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Søk etter brukere..." 
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-test-id="quick-login-search"
        />
      </div>
      
      <div className="border rounded-md">
        <div className="p-2">
          <h3 className="text-sm font-medium flex items-center">
            <Key className="h-3.5 w-3.5 mr-2" />
            <span>Hurtig innlogging</span>
            <Badge variant="outline" className="ml-auto text-xs">Dev Mode</Badge>
          </h3>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto p-1">
          {loading ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : fetchError ? (
            <div className="p-3 text-center text-sm text-destructive">
              {fetchError}
            </div>
          ) : Object.keys(usersByRole).length === 0 ? (
            <div className="p-3 text-center text-sm text-muted-foreground">
              Ingen brukere funnet
            </div>
          ) : (
            <div className="space-y-1">
              {Object.entries(usersByRole).map(([role, users]) => (
                <div key={role} className="px-1">
                  {Object.keys(usersByRole).length > 1 && (
                    <div className="text-xs font-medium text-muted-foreground py-1 px-2 capitalize">
                      {roleDisplayNames[role] || role}
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    {users.map(user => (
                      <Button
                        key={user.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleLoginAs(user)}
                      >
                        <span>{user.name || user.email}</span>
                        {user.company_id && (
                          <Badge variant="outline" className="ml-2 text-xs">Med firma</Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
