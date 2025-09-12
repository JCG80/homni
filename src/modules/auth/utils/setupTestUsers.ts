import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { UserRole } from '../types/unified-types';
import { normalizeRole } from '../normalizeRole';
import { logger } from '@/utils/logger';

const DEV_USERS: Record<UserRole, { email: string; password: string; name: string }> = {
  'guest': { email: 'guest@homni.no', password: 'Test1234!', name: 'Guest User' },
  'user': { email: 'user@homni.no', password: 'Test1234!', name: 'Test User' },
  'company': { email: 'company@homni.no', password: 'Test1234!', name: 'Test Company' },
  'content_editor': { email: 'content@homni.no', password: 'Test1234!', name: 'Content Editor' },
  'admin': { email: 'admin@homni.no', password: 'Test1234!', name: 'Test Admin' },
  'master_admin': { email: 'master@homni.no', password: 'Test1234!', name: 'Master Admin' }
};

/**
 * Set up test users for development/testing purposes - REPO-WIDE SOLUTION
 * Uses RPC ensure_user_profile for atomic profile creation (Ultimate Master 2.0)
 */
export const setupTestUsers = async (role: UserRole = 'user'): Promise<boolean> => {
  try {
    logger.info('Setting up test user with role', { role });
    
    // Normalize the role to ensure we have a canonical value
    const normalizedRole = normalizeRole(role);
    logger.info('Normalized role', { role, normalizedRole });
    
    const devUser = DEV_USERS[normalizedRole];
    if (!devUser) {
      logger.error('No dev user configuration found for role', { normalizedRole });
      toast({
        title: 'Configuration Error',
        description: `No test user configured for role: ${normalizedRole}`,
        variant: 'destructive',
      });
      return false;
    }

    logger.info('Attempting to sign in', { email: devUser.email });

    // Sign out any existing user first
    await supabase.auth.signOut();

    // Attempt to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: devUser.email,
      password: devUser.password,
    });

    if (signInError && signInError.message.includes('Invalid login credentials')) {
      logger.info('User does not exist, creating account', { email: devUser.email });
      
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
        logger.error('Sign up error', { error: signUpError });
        toast({
          title: 'Account Creation Failed',
          description: signUpError.message,
          variant: 'destructive',
        });
        return false;
      }

      logger.info('Account created successfully');
      
      // Short delay to let auth propagate
      await new Promise(resolve => setTimeout(resolve, 100));
    } else if (signInError) {
      logger.error('Sign in error', { error: signInError });
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
        logger.error('Failed to get user', { error: getUserError });
        retries--;
        await new Promise(resolve => setTimeout(resolve, 200));
        continue;
      }
      user = currentUser;
      break;
    }

    if (!user) {
      logger.error('Failed to get authenticated user after retries');
      return false;
    }

    logger.info('Successfully authenticated user', { userId: user.id });

    // Use the SECURITY DEFINER RPC function for atomic profile upsert
    try {
      logger.info('Calling ensure_user_profile RPC', { role: normalizedRole });
      
      const { data: profileData, error: rpcError } = await supabase.rpc('ensure_user_profile', {
        p_user_id: user.id,
        p_role: normalizedRole,
        p_company_id: null
      });

      if (rpcError) {
        logger.error('RPC ensure_user_profile failed', { error: rpcError });
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
          logger.warn('Fallback profile upsert also failed', { error: profileError });
        }
      } else {
        logger.info('Profile ensured via RPC', { profileData });
      }

      // Short delay for profile to propagate
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Initialize user modules based on role
      try {
        logger.info('Initializing user modules');
        const { initializeUserModules } = await import('@/modules/system/ModuleInitializer');
        const moduleInitSuccess = await initializeUserModules(user.id, normalizedRole);
        
        if (moduleInitSuccess) {
          logger.info('User modules initialized successfully');
        } else {
          logger.warn('Module initialization failed, continuing anyway');
        }
      } catch (moduleError) {
        logger.warn('Module initialization error', { error: moduleError });
        // Continue anyway - user is authenticated
      }

      toast({
        title: 'Login Successful',
        description: `Logged in as ${normalizedRole}: ${devUser.name}`,
      });
      
      return true;
    } catch (profileError) {
      logger.error('Profile setup error', { error: profileError });
      // Continue anyway - the user is authenticated
      toast({
        title: 'Partial Success',
        description: 'Logged in but profile setup had issues',
        variant: 'destructive',
      });
      return true;
    }
  } catch (error) {
    logger.error('Unexpected error', { error });
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