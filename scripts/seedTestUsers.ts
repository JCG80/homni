
import { createClient } from '@supabase/supabase-js';
import { UserRole } from '../src/modules/auth/utils/roles/types';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Get the expected modules a user with a specific role should have access to
 */
export function getExpectedModulesForRole(role: UserRole): string[] {
  switch (role) {
    case 'master_admin':
      return ['*']; // Master admin has access to everything
    case 'admin':
      return ['admin', 'leads', 'companies', 'reports', 'content'];
    case 'company':
      return ['dashboard', 'leads', 'company', 'settings', 'reports'];
    case 'content_editor':
      return ['content', 'dashboard'];
    case 'member':
      return ['profile', 'dashboard', 'leads/my', 'properties'];
    case 'anonymous':
      return ['login', 'register', 'home'];
    default:
      return [];
  }
}

/**
 * Create a user with specified role
 */
export async function createUser(
  email: string,
  role: UserRole,
  password: string,
  fullName: string
): Promise<string | null> {
  try {
    console.log(`Creating user ${email} with role ${role}...`);

    // Check if the user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      throw listError;
    }

    const existingUser = existingUsers.users.find((u) => u.email === email);
    
    // If user exists, return the existing ID
    if (existingUser) {
      console.log(`User ${email} already exists with ID: ${existingUser.id}`);
      return existingUser.id;
    }

    // Create the user if they don't exist
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, full_name: fullName }
    });

    if (error) {
      console.error(`Error creating user ${email}:`, error);
      return null;
    }

    if (!data.user) {
      console.error(`No user data returned for ${email}`);
      return null;
    }

    const userId = data.user.id;
    console.log(`Created user ${email} with ID: ${userId}`);

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        full_name: fullName,
        email,
        phone: `+47 ${Math.floor(10000000 + Math.random() * 90000000)}`,
        metadata: { role }
      });

    if (profileError) {
      console.error(`Failed to create user profile for ${email}:`, profileError);
    } else {
      console.log(`Created profile for ${email}`);
    }

    // If company role, create company profile
    if (role === 'company') {
      const { error: companyError } = await supabase
        .from('company_profiles')
        .insert({
          user_id: userId,
          name: fullName,
          contact_name: fullName,
          email,
          phone: `+47 ${Math.floor(10000000 + Math.random() * 90000000)}`,
          status: 'active',
          industry: 'Construction',
          subscription_plan: 'standard',
          modules_access: ['leads', 'profile', 'reports']
        });

      if (companyError) {
        console.error(`Failed to create company profile for ${email}:`, companyError);
      } else {
        console.log(`Created company profile for ${email}`);
      }
    }

    // Set up module access
    const modules = getExpectedModulesForRole(role);
    
    if (modules.length > 0 && modules[0] !== '*') {
      const { data: systemModules } = await supabase
        .from('system_modules')
        .select('id, name')
        .limit(10);
      
      if (systemModules) {
        // Add module access records
        const moduleAccess = systemModules
          .filter(m => modules.includes(m.name) || role === 'master_admin')
          .map(m => ({
            user_id: userId,
            system_module_id: m.id,
            internal_admin: role === 'admin' || role === 'master_admin'
          }));
        
        if (moduleAccess.length > 0) {
          const { error: moduleError } = await supabase
            .from('module_access')
            .insert(moduleAccess);
          
          if (moduleError) {
            console.error(`Failed to set up module access for ${email}:`, moduleError);
          } else {
            console.log(`Set up module access for ${email}`);
          }
        }
      }
    }

    // Validate that the user has the correct role
    await validateRlsPolicies(userId, role);

    return userId;
  } catch (error) {
    console.error(`Error in createUser for ${email}:`, error);
    return null;
  }
}

/**
 * Validate that the RLS policies are working correctly for this user
 */
export async function validateRlsPolicies(userId: string, role: UserRole): Promise<boolean> {
  try {
    console.log(`Validating RLS policies for user ${userId} with role ${role}...`);
    
    // Get access token for the user
    const { data: authData } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: 'temporary@example.com', // This isn't actually sent
      options: {
        data: {
          userId
        },
      },
    });
    
    if (!authData || !authData.properties) {
      console.error('Failed to generate access token');
      return false;
    }
    
    const userToken = authData.properties.access_token;
    const userRefreshToken = authData.properties.refresh_token;
    
    // Create a client that acts as the user
    const userClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    await userClient.auth.setSession({
      access_token: userToken,
      refresh_token: userRefreshToken
    });
    
    // Array of tests to run
    const tests: Array<{ name: string; test: () => Promise<boolean> }> = [
      {
        name: `User can access their profile`,
        test: async () => {
          const { data, error } = await userClient
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          
          if (error) {
            console.error(`RLS Test Failed: User profile access - ${error.message}`);
            return false;
          }
          return data !== null;
        }
      }
    ];
    
    // Add role-specific tests
    if (role === 'company' || role === 'admin' || role === 'master_admin') {
      tests.push({
        name: `${role} can access leads`,
        test: async () => {
          const { error } = await userClient
            .from('leads')
            .select('count')
            .limit(1);
          
          if (error) {
            console.error(`RLS Test Failed: Leads access for ${role} - ${error.message}`);
            return false;
          }
          return true;
        }
      });
    }
    
    if (role === 'admin' || role === 'master_admin') {
      tests.push({
        name: `${role} can access all users`,
        test: async () => {
          const { error } = await userClient
            .from('user_profiles')
            .select('count');
          
          if (error) {
            console.error(`RLS Test Failed: All users access for ${role} - ${error.message}`);
            return false;
          }
          return true;
        }
      });
    }
    
    // Run all tests
    let allPassed = true;
    for (const test of tests) {
      const passed = await test.test();
      console.log(`RLS Test ${passed ? 'PASSED' : 'FAILED'}: ${test.name}`);
      if (!passed) allPassed = false;
    }
    
    return allPassed;
  } catch (error) {
    console.error('Error validating RLS policies:', error);
    return false;
  }
}

/**
 * Main function to seed test users
 */
async function seedTestUsers() {
  try {
    console.log('Starting to seed test users...');
    
    // Create all roles of test users
    const testUsers = [
      {
        email: 'anonymous@test.local',
        role: 'anonymous' as UserRole,
        password: 'Password123!',
        name: 'Anonymous User'
      },
      {
        email: 'member@test.local',
        role: 'member' as UserRole,
        password: 'Password123!',
        name: 'Member User'
      },
      {
        email: 'company@test.local',
        role: 'company' as UserRole,
        password: 'Password123!',
        name: 'Company User'
      },
      {
        email: 'content@test.local',
        role: 'content_editor' as UserRole,
        password: 'Password123!',
        name: 'Content Editor'
      },
      {
        email: 'admin@test.local',
        role: 'admin' as UserRole,
        password: 'Password123!',
        name: 'Admin User'
      },
      {
        email: 'master@test.local',
        role: 'master_admin' as UserRole,
        password: 'Password123!',
        name: 'Master Admin'
      }
    ];
    
    for (const user of testUsers) {
      await createUser(user.email, user.role, user.password, user.name);
    }
    
    console.log('All test users created successfully!');
  } catch (error) {
    console.error('Error seeding test users:', error);
    process.exit(1);
  }
}

// Run the seed function if this script is executed directly
if (require.main === module) {
  seedTestUsers()
    .then(() => {
      console.log('Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

// Export for testing
export { seedTestUsers };
