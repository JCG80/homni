
import { createClient } from '@supabase/supabase-js';
import { UserRole } from '../src/modules/auth/types/types';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing required environment variables SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TestUser {
  email: string;
  role: UserRole;
  password: string;
  name: string;
}

const users: TestUser[] = [
  { email: 'user@test.local', role: 'member', password: 'Test1234!', name: 'Ola Nordmann' },
  { email: 'company@test.local', role: 'company', password: 'Test1234!', name: 'Acme AS' },
  { email: 'admin@test.local', role: 'admin', password: 'Test1234!', name: 'Admin Bruker' },
  { email: 'master-admin@test.local', role: 'master_admin', password: 'Test1234!', name: 'Master Admin' },
  { email: 'content-editor@test.local', role: 'content_editor', password: 'Test1234!', name: 'Ingrid Redaktør' },
  { email: 'guest@test.local', role: 'anonymous', password: 'Test1234!', name: 'Gjest Bruker' },
];

/**
 * Validates that the user has access to the specified modules based on their role
 * This function checks if the RLS policies are working correctly
 */
async function validateRlsPolicies(userId: string, role: UserRole) {
  console.log(`Validating RLS policies for user ${userId} with role ${role}...`);
  
  try {
    // Create a client impersonating this user to test RLS policies
    const { data: authData } = await supabase.auth.admin.getUserById(userId);
    if (!authData?.user) {
      console.error(`User ${userId} not found`);
      return false;
    }
    
    // Get token for this user
    const { data: tokenData, error: tokenError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: authData.user.email!
    });
    
    if (tokenError || !tokenData?.properties?.access_token) {
      console.error(`Failed to get access token for ${userId}:`, tokenError);
      return false;
    }

    // Create client with this user's access token
    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    await userClient.auth.setSession({
      access_token: tokenData.properties.access_token,
      refresh_token: tokenData.properties.refresh_token!
    });

    // Test access to various modules based on role
    const expectedModules = getExpectedModulesForRole(role);
    const allModules = ['leads', 'admin', 'companies', 'content', 'dashboard', 'profile'];
    
    for (const module of allModules) {
      // Try to access module data
      const { data, error } = await userClient
        .from(`${module}_access_check`)
        .select('id')
        .limit(1)
        .maybeSingle();
      
      const hasAccess = !error || error.code !== 'PGRST116'; // No permission error
      const shouldHaveAccess = expectedModules.includes(module) || expectedModules.includes('*');
      
      if (hasAccess !== shouldHaveAccess) {
        console.error(`Policy check failed for ${role} accessing ${module}: expected ${shouldHaveAccess}, got ${hasAccess}`);
        console.error(`Error:`, error);
      } else {
        console.log(`Policy check passed for ${role} accessing ${module}: ${hasAccess ? 'has access' : 'denied'}`);
      }
    }
    
    return true;
  } catch (err) {
    console.error(`Error validating RLS for ${userId}:`, err);
    return false;
  }
}

/**
 * Get the expected modules a role should have access to
 */
function getExpectedModulesForRole(role: UserRole): string[] {
  switch (role) {
    case 'master_admin':
      return ['*']; // Master admin has access to everything
    case 'admin':
      return ['admin', 'leads', 'companies', 'reports', 'content', 'dashboard'];
    case 'company':
      return ['dashboard', 'leads', 'company', 'settings', 'reports'];
    case 'content_editor':
      return ['dashboard', 'content', 'profile'];
    case 'member':
      return ['dashboard', 'leads', 'profile', 'properties', 'maintenance', 'my-account'];
    case 'anonymous':
      return ['home', 'leads/submit', 'info', 'login', 'register'];
    default:
      return [];
  }
}

/**
 * Creates a user with the specified email, role, password, and name
 */
async function createUser(email: string, role: string, password: string, name: string) {
  // First check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const userExists = existingUsers?.users.some(user => user.email === email);
  
  if (userExists) {
    console.log(`User ${email} already exists, checking profiles...`);
    // Get the user ID to check/update profiles
    const { data: userData } = await supabase.auth.admin.listUsers({
      filters: {
        email: email
      }
    });
    
    if (userData && userData.users.length > 0) {
      const userId = userData.users[0].id;
      await ensureUserProfiles(userId, email, role, name);
      await validateRlsPolicies(userId, role as UserRole);
    }
    return;
  }
  
  console.log(`Creating user ${email} with role ${role}...`);
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { 
      role,
      full_name: name
    },
    email_confirm: true,
  });

  if (error) {
    console.error(`Failed to create ${email}:`, error);
    return;
  }

  const id = data.user?.id;
  if (!id) {
    console.error(`No user ID returned for ${email}`);
    return;
  }

  await ensureUserProfiles(id, email, role, name);
  await validateRlsPolicies(id, role as UserRole);
  
  console.log(`✅ Created ${email} with role ${role}`);
}

/**
 * Ensures that all profile records exist for a user
 */
async function ensureUserProfiles(userId: string, email: string, role: string, name: string) {
  // Create comprehensive profile data
  const profileData = {
    id: userId,
    full_name: name,
    email,
    phone: `+47 ${Math.floor(10000000 + Math.random() * 90000000)}`,
    address: `${name.split(' ')[0]}veien ${Math.floor(1 + Math.random() * 100)}, 0123 Oslo`,
    region: 'Oslo',
    profile_picture_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`,
    metadata: { 
      role, 
      account_type: role, 
      company_id: role === 'company' ? userId : undefined,
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'no'
      }
    },
    preferences: { theme: 'light', notifications: true, language: 'no' }
  };
  
  // Check if user_profile exists
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (!existingProfile) {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert(profileData);
    
    if (profileError) {
      console.error(`Failed to create user profile for ${email}:`, profileError);
    } else {
      console.log(`Created user profile for ${email}`);
    }
  } else {
    console.log(`User profile exists for ${email}`);
  }
  
  // If it's a company user, ensure company profile exists
  if (role === 'company') {
    // Check if company profile exists
    const { data: existingCompany } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!existingCompany) {
      const { error: companyError } = await supabase
        .from('company_profiles')
        .insert({
          id: userId,
          user_id: userId,
          name: name,
          status: 'active',
          contact_name: `${name} Contact`,
          email,
          phone: `+47 ${Math.floor(10000000 + Math.random() * 90000000)}`,
          industry: 'Construction',
          subscription_plan: 'standard',
          modules_access: ['leads', 'profile', 'reports']
        });
      
      if (companyError) {
        console.error(`Failed to create company profile for ${email}:`, companyError);
      } else {
        console.log(`Created company profile for ${email}`);
      }
    } else {
      console.log(`Company profile exists for ${email}`);
    }
  }
  
  // Create module access records for the user
  await ensureUserModuleAccess(userId, role as UserRole);
}

/**
 * Ensures that module access records exist for a user based on their role
 */
async function ensureUserModuleAccess(userId: string, role: UserRole) {
  // Get all available system modules
  const { data: modules, error: modulesError } = await supabase
    .from('system_modules')
    .select('*');
  
  if (modulesError || !modules) {
    console.error('Failed to fetch system modules:', modulesError);
    return;
  }
  
  const allowedModules = getExpectedModulesForRole(role);
  const isWildcardAccess = allowedModules.includes('*');
  
  for (const module of modules) {
    const shouldHaveAccess = isWildcardAccess || 
      allowedModules.some(am => module.route?.includes(am) || module.name?.toLowerCase().includes(am));
    
    // Check if user_module record exists
    const { data: existingAccess } = await supabase
      .from('user_modules')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', module.id)
      .maybeSingle();
    
    if (!existingAccess) {
      const { error: accessError } = await supabase
        .from('user_modules')
        .insert({
          user_id: userId,
          module_id: module.id,
          is_enabled: shouldHaveAccess,
          settings: { auto_assigned: true }
        });
      
      if (accessError) {
        console.error(`Failed to create module access for ${userId} to ${module.name}:`, accessError);
      }
    } else if (existingAccess.is_enabled !== shouldHaveAccess) {
      // Update if access level is different
      const { error: updateError } = await supabase
        .from('user_modules')
        .update({ is_enabled: shouldHaveAccess })
        .eq('id', existingAccess.id);
      
      if (updateError) {
        console.error(`Failed to update module access for ${userId} to ${module.name}:`, updateError);
      }
    }
  }
  
  console.log(`Ensured module access for user ${userId}`);
}

/**
 * Main function to create all test users
 */
async function createTestUsers() {
  console.log('Starting test user creation...');
  
  for (const user of users) {
    await createUser(user.email, user.role, user.password, user.name);
  }
  
  console.log('Test user creation completed!');
}

// Execute if this script is run directly
if (require.main === module) {
  createTestUsers()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

// Export for testing
export { createUser, validateRlsPolicies, getExpectedModulesForRole };
