
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TestUser } from '../types/types';
import { UserRole } from '../utils/roles/types';

export const useAllUsers = () => {
  const [users, setUsers] = useState<TestUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (import.meta.env.MODE !== 'development') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // First, get user profiles 
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, full_name, email, metadata');

        if (profilesError) {
          throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
        }

        // Convert profiles to TestUser format
        const formattedUsers: TestUser[] = profiles.map(profile => {
          // Extract role from metadata
          let role: UserRole = 'member';
          if (profile.metadata && typeof profile.metadata === 'object') {
            // Since metadata can be an object or array, we need to check it's an object first
            const metadataObj = profile.metadata as Record<string, any>;
            if (metadataObj.role) {
              role = metadataObj.role as UserRole;
            }
          }

          return {
            id: profile.id,
            name: profile.full_name || '',
            email: profile.email || '',
            role,
            // Default password for dev login - not actually used for authentication
            password: 'Test1234!'  
          };
        });

        // Sort users by role importance
        const roleOrder: Record<string, number> = {
          'master_admin': 1,
          'admin': 2,
          'company': 3,
          'member': 4
        };

        formattedUsers.sort((a, b) => {
          const roleA = roleOrder[a.role] || 99;
          const roleB = roleOrder[b.role] || 99;
          return roleA - roleB;
        });

        setUsers(formattedUsers);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'Unknown error fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
};
