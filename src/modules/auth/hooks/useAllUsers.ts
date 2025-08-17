
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { QuickLoginUser, UserRole } from '../types/unified-types';
import { isUserRole } from '../utils/roles/guards';

/**
 * Hook to fetch all available test users from the database
 */
export const useAllUsers = () => {
  const [users, setUsers] = useState<QuickLoginUser[]>([]);
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
        // Query user profiles directly that have test.local emails
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, full_name, email, metadata')
          .filter('email', 'ilike', '%@test.local');

        if (profilesError) {
          throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
        }

        // Convert profiles to QuickLoginUser format
        const formattedUsers: QuickLoginUser[] = profiles.map(profile => {
          // Extract role from metadata with fallback to 'member'
          let role: UserRole = 'member';

          if (profile.metadata && typeof profile.metadata === 'object') {
            // Try to get role directly from metadata.role
            const metadata = profile.metadata as Record<string, any>;
            
            if (metadata.role && isUserRole(metadata.role)) {
              role = metadata.role;
            }
            // Fallback to account_type if available
            else if (metadata.account_type === 'company') {
              role = 'company';
            }
          }

          return {
            id: profile.id,
            name: profile.full_name || (profile.email ? profile.email.split('@')[0] : 'Unknown'),
            email: profile.email || '',
            role,
            // Extract company_id if it exists in metadata
            company_id: profile.metadata && typeof profile.metadata === 'object' 
              ? (profile.metadata as Record<string, any>).company_id 
              : undefined,
          };
        });

        // Sort users by role importance
        const roleOrder: Record<string, number> = {
          'master_admin': 1,
          'admin': 2,
          'company': 3,
          'content_editor': 4,
          'member': 5
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
