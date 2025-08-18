import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '../types/unified-types';
import { normalizeRole } from '../normalizeRole';

const DEV_USERS: Record<UserRole, { email: string; password: string; name: string }> = {
  'anonymous': { email: 'anon@test.local', password: 'Test1234!', name: 'Anonymous User' },
  'user': { email: 'user@test.local', password: 'Test1234!', name: 'Test User' },
  'company': { email: 'company@test.local', password: 'Test1234!', name: 'Test Company' },
  'content_editor': { email: 'content@test.local', password: 'Test1234!', name: 'Content Editor' },
  'admin': { email: 'admin@test.local', password: 'Test1234!', name: 'Test Admin' },
  'master_admin': { email: 'master-admin@test.local', password: 'Test1234!', name: 'Master Admin' }
};

/**
 * Set up test users for development/testing purposes - REPO-WIDE SOLUTION
 * Uses RPC ensure_user_profile for atomic profile creation (Ultimate Master 2.0)
 */
export const setupTestUsers = async (role: UserRole = 'user'): Promise<boolean> => {
  try {
    console.log(`[setupTestUsers] Setting up test user with role: ${role}`);
    
    // Normalize the role to ensure we have a canonical value
    const normalizedRole = normalizeRole(role);
    console.log(`[setupTestUsers] Normalized role: ${normalizedRole}`);
    
    const devUser = DEV_USERS[normalizedRole];
    if (!devUser) {
      console.error(`[setupTestUsers] No dev user configuration found for role: ${normalizedRole}`);
      toast({
        title: 'Configuration Error',
        description: `No test user configured for role: ${normalizedRole}`,
        variant: 'destructive',
      });
      return false;
    }

    console.log(`[setupTestUsers] Attempting to sign in as: ${devUser.email}`);

    // Sign out any existing user first
    await supabase.auth.signOut();

    // Attempt to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: devUser.email,
      password: devUser.password,
    });

    if (signInError && signInError.message.includes('Invalid login credentials')) {
      console.log(`[setupTestUsers] User doesn't exist, creating account for: ${devUser.email}`);
      
      // Create the user account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: devUser.email,
        password: devUser.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: devUser.name,
            role: normalizedRole,
          },
        },
      });

      if (signUpError) {
        console.error('[setupTestUsers] Sign up error:', signUpError);
        toast({
          title: 'Account Creation Failed',
          description: signUpError.message,
          variant: 'destructive',
        });
        return false;
      }

      console.log('[setupTestUsers] Account created successfully');
      
      // Short delay to let auth propagate
      await new Promise(resolve => setTimeout(resolve, 100));
    } else if (signInError) {
      console.error('[setupTestUsers] Sign in error:', signInError);
      toast({
        title: 'Sign In Failed',
        description: signInError.message,
        variant: 'destructive',
      });
      return false;
    }

    // Get the current user - retry if needed
    let user = null;
    let retries = 3;
    while (retries > 0 && !user) {
      const { data: { user: currentUser }, error: getUserError } = await supabase.auth.getUser();
      if (getUserError) {
        console.error('[setupTestUsers] Failed to get user:', getUserError);
        retries--;
        await new Promise(resolve => setTimeout(resolve, 200));
        continue;
      }
      user = currentUser;
      break;
    }

    if (!user) {
      console.error('[setupTestUsers] Failed to get authenticated user after retries');
      return false;
    }

    console.log(`[setupTestUsers] Successfully authenticated user: ${user.id}`);

    // Use the SECURITY DEFINER RPC function for atomic profile upsert
    try {
      console.log(`[setupTestUsers] Calling ensure_user_profile RPC with role: ${normalizedRole}`);
      
      const { data: profileData, error: rpcError } = await supabase.rpc('ensure_user_profile', {
        p_user_id: user.id,
        p_role: normalizedRole,
        p_company_id: null
      });

      if (rpcError) {
        console.error('[setupTestUsers] RPC ensure_user_profile failed:', rpcError);
        // Fallback to manual profile update
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            user_id: user.id,
            full_name: devUser.name,
            email: devUser.email,
            role: normalizedRole,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.warn('[setupTestUsers] Fallback profile upsert also failed:', profileError);
        }
      } else {
        console.log('[setupTestUsers] Profile ensured via RPC:', profileData);
      }

      // Short delay for profile to propagate
      await new Promise(resolve => setTimeout(resolve, 300));

      toast({
        title: 'Login Successful',
        description: `Logged in as ${normalizedRole}: ${devUser.name}`,
      });
      
      return true;
    } catch (profileError) {
      console.error('[setupTestUsers] Profile setup error:', profileError);
      // Continue anyway - the user is authenticated
      toast({
        title: 'Partial Success',
        description: 'Logged in but profile setup had issues',
        variant: 'destructive',
      });
      return true;
    }
  } catch (error) {
    console.error('[setupTestUsers] Unexpected error:', error);
    toast({
      title: 'Unexpected Error',
      description: 'An unexpected error occurred during test user setup',
      variant: 'destructive',
    });
    return false;
  }
};

/**
 * Adds a QuickLogin component to the page for easy testing
 * Only available in development mode
 */
export const addQuickLoginToPage = () => {
  if (import.meta.env.MODE !== 'development') {
    return;
  }
  
  // Implementation would go here if needed
};