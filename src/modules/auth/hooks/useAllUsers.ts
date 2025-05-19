
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TestUser } from '../types/types';
import { UserRole } from '../utils/roles/types';

/**
 * Hook to fetch all available test users from the database
 */
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
        // Query user profiles directly - now that we have ensured they exist and have the correct metadata
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, full_name, email, metadata')
          .filter('email', 'ilike', '%@test.local');

        if (profilesError) {
          throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
        }

        // Convert profiles to TestUser format
        const formattedUsers: TestUser[] = profiles.map(profile => {
          // Extract role from metadata
          let role: UserRole = 'member';
          if (profile.metadata && typeof profile.metadata === 'object') {
            const metadataObj = profile.metadata as Record<string, any>;
            if (metadataObj.role) {
              role = metadataObj.role as UserRole;
            }
          }

          return {
            id: profile.id,
            name: profile.full_name || profile.email.split('@')[0],
            email: profile.email || '',
            role,
            // No password needed for passwordless login
          };
        });

        // Sort users by role importance
        const roleOrder: Record<string, number> = {
          'master_admin': 1,
          'admin': 2,
          'company': 3,
          'member': 4,
          'content_editor': 5
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
