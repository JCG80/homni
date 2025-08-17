
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import { UserRole, normalizeRole } from '@/types/auth';

/**
 * Sets up a test user by signing in with a predefined account
 * Used for development and testing purposes
 */
export const setupTestUsers = async (role: UserRole = 'user') => {
  try {
    const normalizedRole = normalizeRole(role);
    let email = '';
    let password = 'Test1234!';

    // Map canonical role to email
    switch (normalizedRole) {
      case 'master_admin':
        email = 'master-admin@test.local';
        break;
      case 'admin':
        email = 'admin@test.local';
        break;
      case 'company':
        email = 'company@test.local';
        break;
      case 'content_editor':
        email = 'content@test.local';
        break;
      case 'user':
        email = 'user@test.local';
        break;
      case 'guest':
        email = 'guest@test.local';
        break;
      default:
        email = 'user@test.local'; // Default to user
    }

    console.log(`Logging in as ${normalizedRole} (from ${role}) using ${email}`);
    
    // Sign in with the configured email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error(`Error signing in as ${normalizedRole}:`, error);
      toast({
        title: "Login Failed",
        description: `Could not login as ${role}: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }

    if (data.user) {
      console.log(`Successfully signed in as ${role} (${email})`);
      
      // Ensure the user profile exists and has the correct role
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: data.user.id,
          user_id: data.user.id, // Ensure user_id is set to the correct ID
          metadata: { role: role },
          email: email
        }, { onConflict: 'id' });
        
      if (profileError) {
        console.warn("Could not update user profile:", profileError);
      } else {
        console.log(`Profile updated with correct role (${role})`);
      }
      
      toast({
        title: "Login Success",
        description: `Logged in as ${role} (${email})`,
        variant: "default"
      });
      
      // Force page reload to ensure auth state is updated everywhere
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
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
