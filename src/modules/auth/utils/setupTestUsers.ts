
import { supabase } from '@/integrations/supabase/client';
import { TEST_USERS } from './devLogin';

/**
 * Setup test users in the database
 * This function is meant to be called from the developer console
 * or a dedicated admin page
 */
export async function setupTestUsers() {
  console.log('Setting up test users...');
  
  for (const user of TEST_USERS) {
    try {
      console.log(`Creating user ${user.email} with role ${user.role}...`);
      
      // Check if user already exists
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password || 'default_password'
      });
      
      if (existingUser?.user) {
        console.log(`User ${user.email} already exists.`);
        continue;
      }
      
      // Create user
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password || 'default_password',
        options: {
          data: {
            role: user.role,
            full_name: user.name
          }
        }
      });
      
      if (error) {
        console.error(`Failed to create user ${user.email}:`, error);
      } else {
        console.log(`Successfully created user ${user.email}`);
      }
    } catch (err) {
      console.error(`Error creating user ${user.email}:`, err);
    }
  }
  
  console.log('Test user setup completed');
  return true;
}

// Add a global function that developers can call from the console
// @ts-ignore - This is intentionally exposed to the window object for dev use
window.setupTestUsers = setupTestUsers;
