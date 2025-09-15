import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, User, Mail } from 'lucide-react';
import { debounce } from 'lodash';
import type { UserRole } from '@/modules/auth/normalizeRole';

interface SearchResult {
  id: string;
  full_name: string;
  email: string;
}

interface UserWithRoles extends SearchResult {
  roles: Array<{
    role: UserRole;
    granted_at: string;
    expires_at: string | null;
  }>;
}

interface UserSearchProps {
  onUserSelect: (user: UserWithRoles) => void;
}

export const UserSearch: React.FC<UserSearchProps> = ({ onUserSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      if (term.length >= 2) {
        setIsSearching(true);
      } else {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Search users query
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['user-search', searchTerm],
    queryFn: async () => {
      if (searchTerm.length < 2) return [];
      
      const { data, error } = await supabase.rpc('search_users', {
        term: searchTerm
      });

      if (error) throw error;

      // For each user, fetch their roles
      const usersWithRoles: UserWithRoles[] = [];
      
      for (const user of data) {
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role, granted_at, expires_at')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (rolesError) throw rolesError;

        usersWithRoles.push({
          ...user,
          roles: roles || []
        });
      }

      return usersWithRoles;
    },
    enabled: searchTerm.length >= 2,
    staleTime: 30000, // Cache results for 30 seconds
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'master_admin': return 'destructive';
      case 'admin': return 'secondary';
      case 'content_editor': return 'outline';
      case 'company': return 'default';
      case 'user': return 'outline';
      case 'guest': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Søk etter brukere (navn eller e-post)..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Search Results */}
      {searchTerm.length >= 2 && (
        <Card>
          <CardContent className="p-0">
            {isLoading && (
              <div className="p-4 text-center text-muted-foreground">
                Søker...
              </div>
            )}
            
            {!isLoading && searchResults && (
              <div className="max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-accent cursor-pointer"
                      onClick={() => onUserSelect(user)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{user.full_name || 'Ukjent navn'}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map((roleData, index) => (
                            <Badge 
                              key={index} 
                              variant={getRoleBadgeVariant(roleData.role)}
                              className="text-xs"
                            >
                              {roleData.role}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Ingen roller
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    Ingen brukere funnet for "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {searchTerm.length > 0 && searchTerm.length < 2 && (
        <div className="text-sm text-muted-foreground text-center p-2">
          Skriv minst 2 tegn for å søke
        </div>
      )}
    </div>
  );
};