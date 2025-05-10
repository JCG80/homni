
import { createClient } from '@supabase/supabase-js';
import { TestUser } from '../src/modules/auth/types/types';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const users: TestUser[] = [
  { email: 'user@test.local', role: 'user', password: 'Test1234!', name: 'Test User' },
  { email: 'company@test.local', role: 'company', password: 'Test1234!', name: 'Test Company' },
  { email: 'admin@test.local', role: 'admin', password: 'Test1234!', name: 'Test Admin' },
  { email: 'master-admin@test.local', role: 'master-admin', password: 'Test1234!', name: 'Test Master Admin' },
  { email: 'provider@test.local', role: 'provider', password: 'Test1234!', name: 'Test Provider' },
];

async function createUser(email: string, role: string, password: string, name: string) {
  // First check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const userExists = existingUsers?.users.some(user => user.email === email);
  
  if (userExists) {
    console.log(`User ${email} already exists, skipping creation`);
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
  if (!id) return;

  // Based on the current database schema, user_profiles only has id and full_name fields
  if (role === 'company') {
    // Insert into company_profiles
    const { error: companyError } = await supabase.from('company_profiles').insert({
      user_id: id,
      name: name,
      status: 'active',
    });
    
    if (companyError) {
      console.error(`Failed to create company profile for ${email}:`, companyError);
    }
  } else {
    // Insert into user_profiles - the table only has id and full_name based on current schema
    const { error: profileError } = await supabase.from('user_profiles').insert({
      id: id, // Note: for user_profiles, 'id' is used directly
      full_name: name,
    });
    
    if (profileError) {
      console.error(`Failed to create user profile for ${email}:`, profileError);
    }
  }

  console.log(`✅ Created ${email} with role ${role}`);
}

(async () => {
  console.log('Starting test user creation...');
  for (const user of users) {
    await createUser(user.email, user.role, user.password, user.name);
  }
  console.log('Test user creation complete!');
})();
