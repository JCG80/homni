
import { supabase } from '@/integrations/supabase/client';
import { TEST_USERS } from '../utils/devLogin';

/**
 * Setup test users in the database
 * This function is meant to be called from the developer console
 * or a dedicated admin page
 */
export async function setupTestUsers() {
  console.log('Setting up test users...');
  
  for (const user of TEST_USERS) {
    try {
      console.log(`Creating or checking user ${user.email} with role ${user.role}...`);
      
      // Check if user already exists in auth
      const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password || 'Test1234!'
      });
      
      if (checkError && !checkError.message.includes('Invalid login credentials')) {
        console.error(`Unexpected error checking ${user.email}:`, checkError);
      }
      
      if (existingUser?.user) {
        console.log(`User ${user.email} already exists, updating profiles if needed.`);
        
        // Ensure user profile exists
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('email', user.email)
          .single();
          
        if (!existingProfile) {
          // Create profile for existing user
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: existingUser.user.id,
              full_name: user.name,
              email: user.email,
              phone: `+47 ${Math.floor(10000000 + Math.random() * 90000000)}`,
              metadata: { role: user.role }
            });
            
          if (profileError) {
            console.error(`Failed to create profile for ${user.email}:`, profileError);
          } else {
            console.log(`Created profile for existing user ${user.email}`);
          }
        }
        
        continue;
      }
      
      // Create new user if doesn't exist
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password || 'Test1234!',
        options: {
          data: {
            role: user.role,
            full_name: user.name
          }
        }
      });
      
      if (error) {
        console.error(`Failed to create user ${user.email}:`, error);
        continue;
      } else {
        console.log(`Successfully created user ${user.email}`);
      }
      
      if (!data.user) {
        console.error(`No user data returned for ${user.email}`);
        continue;
      }
      
      // Create user profile
      const profileData = {
        id: data.user.id,
        full_name: user.name,
        email: user.email,
        phone: `+47 ${Math.floor(10000000 + Math.random() * 90000000)}`,
        metadata: { role: user.role }
      };
      
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert(profileData);
        
      if (profileError) {
        console.error(`Failed to create user profile for ${user.email}:`, profileError);
      } else {
        console.log(`Created profile for ${user.email}`);
      }
      
      // Create company profile if it's a company user
      if (user.role === 'company') {
        const { error: companyError } = await supabase
          .from('company_profiles')
          .insert({
            user_id: data.user.id,
            name: user.name,
            status: 'active',
            contact_name: `${user.name} Contact`,
            email: user.email,
            phone: `+47 ${Math.floor(10000000 + Math.random() * 90000000)}`,
            industry: 'Construction',
            subscription_plan: 'standard',
            modules_access: ['leads', 'profile', 'reports']
          });
          
        if (companyError) {
          console.error(`Failed to create company profile for ${user.email}:`, companyError);
        } else {
          console.log(`Created company profile for ${user.email}`);
        }
      }
    } catch (err) {
      console.error(`Error processing user ${user.email}:`, err);
    }
  }
  
  console.log('Test user setup completed');
  return true;
}

// Add a global function that developers can call from the console
// @ts-ignore - This is intentionally exposed to the window object for dev use
window.setupTestUsers = setupTestUsers;
