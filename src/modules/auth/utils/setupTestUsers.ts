import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '../types/unified-types';

/**
 * Sets up a test user by signing in with a predefined account
 * If the account doesn't exist, it creates it automatically
 * Used for development and testing purposes
 */
export const setupTestUsers = async (role: UserRole = 'user'): Promise<boolean> => {
  try {
    // Map role to email
    const getEmailForRole = (role: UserRole): string => {
      switch (role) {
        case 'master_admin': return 'master-admin@test.local';
        case 'admin': return 'admin@test.local';
        case 'company': return 'company@test.local';
        case 'content_editor': return 'content@test.local';
        case 'user': return 'user@test.local';
        case 'anonymous': return 'anonymous@test.local';
        default: return 'user@test.local';
      }
    };

    const email = getEmailForRole(role);
    const password = 'Test1234!';

    console.log(`Attempting quick login as ${role} using ${email}`);
    
    // First, sign out any existing user
    await supabase.auth.signOut();

    // Try to sign in with existing credentials
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    let userData = signInData;

    // If sign in fails, try to create the account
    if (signInError) {
      console.log(`Sign in failed for ${email}, attempting to create account:`, signInError.message);
      
      // Try to sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            role: role
          }
        }
      });

      if (signUpError) {
        console.error(`Failed to create account for ${email}:`, signUpError);
        toast({
          title: "Account Creation Failed",
          description: `Could not create account for ${role}: ${signUpError.message}`,
          variant: "destructive"
        });
        return false;
      }

      // If sign up succeeded, try signing in again
      if (signUpData.user) {
        console.log(`Account created for ${email}, now signing in...`);
        
        const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (retryError) {
          console.error(`Failed to sign in after account creation:`, retryError);
          toast({
            title: "Login Failed",
            description: `Account created but login failed: ${retryError.message}`,
            variant: "destructive"
          });
          return false;
        }

        userData = retrySignIn;
      }
    }

    if (userData?.user) {
      console.log(`Successfully signed in as ${role} (${email})`);
      
      // Ensure the user profile exists and has the correct role
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userData.user.id,
          user_id: userData.user.id,
          role: role,
          metadata: { role: role },
          email: email,
          full_name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`
        }, { onConflict: 'id' });
        
      if (profileError) {
        console.warn("Could not update user profile:", profileError);
        // Don't fail completely if profile update fails
      } else {
        console.log(`Profile updated with correct role (${role})`);
      }
      
      toast({
        title: "Login Success",
        description: `Logged in as ${role} (${email})`,
        variant: "default"
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Unexpected error in setupTestUsers:', error);
    toast({
      title: "Setup Failed",
      description: `Unexpected error setting up test user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive"
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